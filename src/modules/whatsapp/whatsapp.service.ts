import { HttpService } from "@nestjs/axios";
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { UsuarioService } from "../admin/usuario/usuario.service";
import { lastValueFrom } from "rxjs";
import { Envio } from "../envio/entities/envio.entity";
import { EnvioService } from "../envio/envio.service";

@Injectable()
export class WhatsappService {
  constructor(
    private readonly http: HttpService,
    private readonly usuarioService: UsuarioService,
    private readonly envioService: EnvioService
  ) {}

  async getQR(idUsuario: number) {
    const { instance, token } = await this.usuarioService.findOne(idUsuario);
    const response = await lastValueFrom(
      this.http.get(
        `https://api.ultramsg.com/${instance}/instance/qrCode?token=${token}`
      )
    );
    const data = response.data?.qrCode;
    if (data) {
      return { qrCode: data };
    } else {
      throw new NotFoundException("QR Code not found");
    }
  }

  async getEstado(idUsuario: number) {
    try {
      const { instance, token } = await this.usuarioService.findOne(idUsuario);
      const url = `https://api.ultramsg.com/${instance}/instance/status?token=${token}`;

      const call = await lastValueFrom(this.http.get(url));

      if (call?.data) {
        return call?.data;
      } else {
        throw new NotFoundException("Estado no encontrado");
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Error al obtener el estado");
    }
  }

  async logout(idUsuario: number) {
    const { instance, token } = await this.usuarioService.findOne(idUsuario);

    const data = new URLSearchParams();
    data.append("token", token);

    const headers = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    const url = `https://api.ultramsg.com/${instance}/instance/logout`;

    const res: any = await lastValueFrom(this.http.post(url, data, headers));

    if (res.data?.success == "done") {
      return { message: "Sesión cerrada" };
    } else {
      throw new InternalServerErrorException("Error al cerrar sesión");
    }
  }

  async getPerfil(idUsuario: number) {
    try {
      const { instance, token } = await this.usuarioService.findOne(idUsuario);
      const response = await lastValueFrom(
        this.http.get(
          `https://api.ultramsg.com/${instance}/instance/me?token=${token}`
        )
      );
      const data = response?.data;
      if (!data) {
        throw new NotFoundException("Perfil no encontrado");
      }

      console.log(data);

      return {
        phone: data?.id,
        nombre: data?.name,
        imagen: data?.profile_picture,
        is_business: data?.is_business,
      };
    } catch (error) {
      throw new InternalServerErrorException("Error al obtener el perfil");
    }
  }

  async send(envio: Envio) {
    try {
      // Cambiar estado a Enviando
      await this.envioService.updateEstado(envio.id, "Enviando");
      const { instance, token } = envio.usuario;

      // Función para procesar cada destinatario
      const processDestinatario = async (destinatario, tipo: string) => {
        if (destinatario.intentos >= 3) return;

        const reemplazo = envio.mensaje.replace(
          "@CLIENTE",
          destinatario.nombre
        );

        let form = new URLSearchParams();
        form.append("token", token);
        form.append("to", destinatario.telf);
        
        // Mensaje
        if (tipo == "Normal") {
          form.append("body", reemplazo);
          return await this.sendRequest(
            instance,
            "chat",
            form,
            destinatario.id,
            envio.id
          );
        }
        // Imagen
        if (tipo == "Imagen") {
          form.append("caption", reemplazo);
          form.append("image", envio.urlArchivo);
          return await this.sendRequest(
            instance,
            "image",
            form,
            destinatario.id,
            envio.id
          );
        }
        // Documento
        if (tipo == "Pdf") {
          const nombreArchivo = envio.nombreArchivo ?? "documento";
          form.append("filename", `${nombreArchivo}.pdf`);
          form.append("document", envio.urlArchivo);
          form.append("caption", reemplazo);
          return await this.sendRequest(
            instance,
            "document",
            form,
            destinatario.id,
            envio.id
          );
        }

        // Video
        if (tipo == "Video") {
          form.append("video", envio.urlArchivo);
          form.append("caption", reemplazo);
          return await this.sendRequest(
            instance,
            "video",
            form,
            destinatario.id,
            envio.id
          );
        }
      };

      // Usar un bucle for...of en lugar de forEach para manejar promesas adecuadamente
      for (const destinatario of envio.destinatarios) {
        await processDestinatario(destinatario, envio.tipoEnvio.nombre);
      }
    } catch (error) {
      console.error("Api Error:", error.message);
    }
  }

  // Función reutilizable para manejar las solicitudes HTTP
  private async sendRequest(
    instance: string,
    endpoint: string,
    form: URLSearchParams,
    destinatarioId: number,
    envioId: number
  ) {
    try {
      const url = `https://api.ultramsg.com/${instance}/messages/${endpoint}`;
      const callApi = await lastValueFrom(
        this.http.post(url, form, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
      );

      if (callApi?.data?.message === "ok") {
        await this.envioService.updateDestinatarioEnviado(destinatarioId);
        await this.envioService.verificarEnvioCompletado(envioId);
      } else {
        await this.envioService.updateIntento(destinatarioId);
      }
    } catch (error) {
      console.error("Error sending message:", error.message);
    }
  }
}
