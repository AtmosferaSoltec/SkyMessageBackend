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

  async sendEnvios(envios: Envio[]) {
    try {
      console.log(envios);
      
      envios.forEach(async (envio) => {
        const { instance, token } = envio.usuario;
        if (envio.tipoEnvio.nombre == "Normal") {
          envio.destinatarios.forEach(async (destinatario) => {
            if (destinatario.intentos >= 3) {
              return;
            }

            const form = new URLSearchParams();
            form.append("token", token);
            form.append("to", destinatario.telf);

            // Reemplazar @CLIENTE por el nombre del cliente del mensaje
            const reemplazo = envio.mensaje.replace(
              "@CLIENTE",
              destinatario.nombre
            );

            form.append("body", reemplazo);
            const url = `https://api.ultramsg.com/${instance}/messages/chat`;
            const callApi = await lastValueFrom(
              this.http.post(url, form, {
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
              })
            );

            if (callApi?.data?.message == "ok") {
              await this.envioService.updateDestinatarioEnviado(
                destinatario.id
              );
            } else {
              await this.envioService.updateIntento(destinatario.id);
            }
          });
        }
        if (envio.tipoEnvio.nombre == "Imagen") {
          const form = new URLSearchParams();
          form.append("token", token);
          form.append("to", envio.destinatarios[0].telf);
          form.append("caption", envio.mensaje);
          form.append("image", envio.urlArchivo);
          const url = `https://api.ultramsg.com/${instance}/messages/image`;
          const callApi = await lastValueFrom(
            this.http.post(url, form, {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            })
          );
          if (callApi?.data?.message == "ok") {
            await this.envioService.updateDestinatarioEnviado(
              envio.destinatarios[0].id
            );
          } else {
            await this.envioService.updateIntento(envio.destinatarios[0].id);
          }
        }
      });
    } catch (error) {
      //console.log('Api Error', error?.message);
    }
  }
}
