import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UpdateEnvioDto } from "./dto/update-envio.dto";
import { CreateEnvioDto } from "./dto/create-envio.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Envio } from "./entities/envio.entity";
import { Repository } from "typeorm";
import { Destinatario } from "./entities/destinatario.entity";
import { EstadoDestinatario } from "./entities/estado-destinatario.entity";
import { UsuarioService } from "../admin/usuario/usuario.service";
import { TipoEnvio } from "./entities/tipo-envio.entity";
import { EstadoEnvio } from "./entities/estado-envio.entity";

@Injectable()
export class EnvioService {
  constructor(
    @InjectRepository(Envio)
    private readonly repo: Repository<Envio>,

    @InjectRepository(EstadoEnvio)
    private readonly repoEstadoEnvio: Repository<EstadoEnvio>,

    @InjectRepository(Destinatario)
    private readonly repoDestinatario: Repository<Destinatario>,

    @InjectRepository(EstadoDestinatario)
    private readonly repoEstadoDestinario: Repository<EstadoDestinatario>,

    @InjectRepository(TipoEnvio)
    private readonly repoTipoEnvio: Repository<TipoEnvio>,

    private readonly usuarioService: UsuarioService
  ) {}

  async create(dto: CreateEnvioDto, idUser: number) {
    //Buscar Usuario
    const user = await this.usuarioService.findOne(idUser);

    // Buscar Estado Pendiente
    const pendiente = await this.repoEstadoDestinario.findOne({
      where: { nombre: "Pendiente" },
    });

    if (!pendiente) {
      throw new NotFoundException("Estado no encontrado");
    }

    // Buscar Tipo Envio
    const tipoEnvio = await this.repoTipoEnvio.findOne({
      where: { id: dto.tipoEnvio },
    });

    if (!tipoEnvio) {
      throw new NotFoundException("Tipo de envio no encontrado");
    }

    // Buscar Estado Envio
    const estadoEnvio = await this.repoEstadoEnvio.findOne({
      where: { nombre: "Pendiente" },
    });

    if (!estadoEnvio) {
      throw new NotFoundException("Estado de envio no encontrado");
    }

    // Obtener correlativo por usuario
    let lastEnvio = await this.repo.findOne({
      where: { usuario: user },
      order: { correlativo: "DESC" },
    });

    let correlativo = lastEnvio?.correlativo;

    if (!correlativo) {
      correlativo = 0;
    }

    //Crear Envio
    const envio = this.repo.create({
      correlativo: correlativo + 1,
      mensaje: dto.mensaje,
      usuario: user,
      tipoEnvio: tipoEnvio,
      urlArchivo: dto.urlArchivo,
      estado: estadoEnvio,
    });

    const envioSave = await this.repo.save(envio);

    // Crear Destinatarios sin duplicados de teléfono, con validación de 9 dígitos y solo números
    const uniqueDestinatarios = dto.destinatarios.filter(
      (dest, index, self) =>
        /^[0-9]{9}$/.test(dest.telf) && // Validar que el teléfono tenga exactamente 9 dígitos numéricos
        index === self.findIndex((d) => d.telf === dest.telf) // Verificar que sea el primer contacto con ese teléfono
    );

    if (uniqueDestinatarios.length == 0) {
      throw new ConflictException("No hay destinatarios válidos");
    }

    //Crear Destinatarios
    const dests = uniqueDestinatarios.map((dest) => {
      return this.repoDestinatario.create({
        ...dest,
        estado: pendiente,
        envio: envioSave,
      });
    });

    await this.repoDestinatario.save(dests);

    return await this.findOne(envioSave.id);
  }

  async findAllHistorial(idUsuario: number) {
    const user = await this.usuarioService.findOne(idUsuario);

    const envios = await this.repo.find({
      relations: [
        "destinatarios",
        "destinatarios.estado",
        "tipoEnvio",
        "estado",
      ],
      order: { created_at: "DESC" },
      where: { usuario: user },
    });
    const listMap = envios.map((envio) => {
      const { destinatarios } = envio;
      const enviados = destinatarios.filter((dest) => {
        return dest.estado.nombre == "Enviado";
      });

      //verificar si el urlArchivo es una url valida si no, mandar como null
      let urlArchivo = null;
      if (envio.urlArchivo) {
        urlArchivo = envio.urlArchivo;
      }

      return {
        id: envio.id,
        correlativo: envio.correlativo,
        mensaje: envio.mensaje,
        created_at: envio.created_at,
        enviados: enviados.length,
        total: envio.destinatarios.length,
        tipoEnvio: envio.tipoEnvio.nombre,
        urlArchivo: urlArchivo,
        estado: envio.estado.nombre,
      };
    });
    return listMap;
  }

  async findAll() {
    try {
      const list = await this.repo.find({
        relations: [
          "destinatarios",
          "destinatarios.estado",
          "usuario",
          "tipoEnvio",
        ],
      });

      return list;
      return list.map((envio) => ({
        id: envio.id,
        correlativo: envio.correlativo,
        mensaje: envio.mensaje,
        created_at: envio.created_at,
        destinatarios: envio.destinatarios
          .filter((dest) => dest.estado.nombre == "Pendiente")
          .map((destinatario) => ({
            nombre: destinatario.nombre,
            telf: destinatario.telf,
            estado: destinatario.estado.nombre,
          })),
      }));
    } catch (error) {
      throw new Error(`Error al obtener envíos: ${error.message}`);
    }
  }

  async findNumberEnvios(count: number) {
    const envio = await this.repo.findOne({
      relations: [
        "usuario",
        "destinatarios",
        "destinatarios.estado",
        "tipoEnvio",
      ],
      where: { destinatarios: { estado: { nombre: "Pendiente" } } },
      order: { created_at: "DESC" },
    });
    if (!envio) {
      return;
    }

    // Filtrar destinatarios pendientes manualmente
    const destinatariosPendientes = envio.destinatarios
      .filter((d) => d.estado.nombre === "Pendiente")
      .slice(0, count);

    return {
      ...envio,
      destinatarios: destinatariosPendientes,
    };
  }

  async findOne(id: number) {
    const envio = await this.repo.findOne({ where: { id } });
    return envio;
  }

  async update(id: number, updateEnvioDto: UpdateEnvioDto) {}

  async remove(id: number) {
    return `This action removes a #${id} envio`;
  }

  async stopEnvio(idEnvio: number, idUsuario: number) {
    const envio = await this.repo.findOne({
      where: { id: idEnvio },
      relations: ["destinatarios"],
    });

    if (!envio) {
      throw new NotFoundException("Envio no encontrado");
    }

    const cancelado = await this.repoEstadoDestinario.findOne({
      where: { nombre: "Cancelado" },
    });

    if (!cancelado) {
      throw new NotFoundException("Estado no encontrado");
    }

    envio.destinatarios.forEach(async (dest) => {
      if (dest.estado.nombre == "Pendiente") {
        dest.estado = cancelado;
        await this.repoDestinatario.save(dest);
      }
    });

    const estadoEnvio = await this.repoEstadoEnvio.findOne({
      where: { nombre: "Cancelado" },
    });

    if (!estadoEnvio) {
      throw new NotFoundException("Estado no encontrado");
    }

    envio.estado = estadoEnvio;

    await this.repo.save(envio);
    return;
  }

  async updateEstado(idEnvio: number, estado: string) {
    const estadoEnvio = await this.repoEstadoEnvio.findOne({
      where: { nombre: estado },
    });

    if (!estadoEnvio) {
      throw new NotFoundException("Estado no encontrado");
    }
    const envio = await this.repo.findOne({ where: { id: idEnvio } });

    if (!envio) {
      throw new NotFoundException("Envio no encontrado");
    }
    envio.estado = estadoEnvio;
    await this.repo.save(envio);
    return;
  }

  async updateEstadoDestinario(idDestinatario: number, idEstado: number) {
    const estadoEstadoDestinatario = await this.repoEstadoDestinario.findOne({
      where: { id: idEstado },
    });

    if (!estadoEstadoDestinatario) {
      throw new NotFoundException("Estado no encontrado");
    }

    const destinatario = await this.repoDestinatario.findOne({
      where: { id: idDestinatario },
    });

    if (!destinatario) {
      throw new NotFoundException("Destinatario no encontrado");
    }

    destinatario.estado = estadoEstadoDestinatario;
    await this.repoDestinatario.save(destinatario);
    return;
  }

  async verificarEnvioCompletado(idEnvio: number) {
    const envio = await this.repo.findOne({
      where: { id: idEnvio },
      relations: ["destinatarios"],
    });

    if (!envio) {
      throw new NotFoundException("Envio no encontrado");
    }

    // Verificar si todos los destinatarios tienen estado Enviado
    const enviados = envio.destinatarios.filter(
      (dest) => dest.estado.nombre == "Enviado"
    );

    if (enviados.length == envio.destinatarios.length) {
      const estadoEnvioCompletado = await this.repoEstadoEnvio.findOne({
        where: { nombre: "Completado" },
      });

      if (!estadoEnvioCompletado) {
        throw new NotFoundException("Estado no encontrado");
      }

      envio.estado = estadoEnvioCompletado;
      await this.repo.save(envio);
    }
  }
}
