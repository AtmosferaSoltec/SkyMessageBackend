import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateEnvioDto } from './dto/update-envio.dto';
import { CreateEnvioDto } from './dto/create-envio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Envio } from './entities/envio.entity';
import { Repository } from 'typeorm';
import { Destinatario } from './entities/destinatario.entity';
import { EstadoDestinatario } from './entities/estado-destinatario.entity';
import { UsuarioService } from '../admin/usuario/usuario.service';
import { TipoEnvio } from './entities/tipo-envio.entity';

@Injectable()
export class EnvioService {
  constructor(
    @InjectRepository(Envio)
    private readonly repo: Repository<Envio>,

    @InjectRepository(Destinatario)
    private readonly repoDestinatario: Repository<Destinatario>,

    @InjectRepository(EstadoDestinatario)
    private readonly repoEstado: Repository<EstadoDestinatario>,

    @InjectRepository(TipoEnvio)
    private readonly repoTipoEnvio: Repository<TipoEnvio>,

    private readonly usuarioService: UsuarioService,
  ) {}

  async create(dto: CreateEnvioDto, idUser: number) {
    //Buscar Usuario
    const user = await this.usuarioService.findOne(idUser);

    // Buscar Estado Pendiente
    const pendiente = await this.repoEstado.findOne({
      where: { nombre: 'Pendiente' },
    });

    if (!pendiente) {
      throw new NotFoundException('Estado no encontrado');
    }

    // Buscar Tipo Envio
    const tipoEnvio = await this.repoTipoEnvio.findOne({
      where: { id: dto.tipoEnvio },
    });

    if (!tipoEnvio) {
      throw new NotFoundException('Tipo de envio no encontrado');
    }

    // Obtener correlativo por usuario
    let lastEnvio = await this.repo.findOne({
      where: { usuario: user },
      order: { correlativo: 'DESC' },
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
    });

    const envioSave = await this.repo.save(envio);

    // Crear Destinatarios sin duplicados de teléfono, con validación de 9 dígitos y solo números
    const uniqueDestinatarios = dto.destinatarios.filter(
      (dest, index, self) =>
        /^[0-9]{9}$/.test(dest.telf) && // Validar que el teléfono tenga exactamente 9 dígitos numéricos
        index === self.findIndex((d) => d.telf === dest.telf), // Verificar que sea el primer contacto con ese teléfono
    );

    if (uniqueDestinatarios.length == 0) {
      throw new ConflictException('No hay destinatarios válidos');
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
      relations: ['destinatarios', 'destinatarios.estado'],
      order: { created_at: 'DESC' },
      where: { usuario: user },
    });
    const listMap = envios.map((envio) => {
      const { destinatarios } = envio;
      const enviados = destinatarios.filter((dest) => {
        return dest.estado.nombre == 'Enviado';
      });

      return {
        id: envio.id,
        correlativo: envio.correlativo,
        mensaje: envio.mensaje,
        created_at: envio.created_at,
        enviados: enviados.length,
        total: envio.destinatarios.length,
      };
    });
    return listMap;
  }

  async findAll() {
    try {
      const list = await this.repo.find({
        relations: [
          'destinatarios',
          'destinatarios.estado',
          'usuario',
          'tipoEnvio',
        ],
      });

      return list;
      return list.map((envio) => ({
        id: envio.id,
        correlativo: envio.correlativo,
        mensaje: envio.mensaje,
        created_at: envio.created_at,
        destinatarios: envio.destinatarios
          .filter((dest) => dest.estado.nombre == 'Pendiente')
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

  async find10Envios() {
    const envios = await this.repo.find({
      relations: ['usuario', 'destinatarios', 'destinatarios.estado', 'tipoEnvio'],
      where: { destinatarios: { estado: { nombre: 'Pendiente' } } },
      order: { created_at: 'DESC' },
      take: 50,
    });

    return envios;
  }

  async findOne(id: number) {
    const envio = await this.repo.findOne({ where: { id } });
    return envio;
  }

  async update(id: number, updateEnvioDto: UpdateEnvioDto) {}

  async remove(id: number) {
    return `This action removes a #${id} envio`;
  }

  async updateIntento(idDestinatario: number) {
    const destinatario = await this.repoDestinatario.findOne({
      where: { id: idDestinatario },
    });
    if (!destinatario) {
      throw new NotFoundException('Destinatario no encontrado');
    }
    destinatario.intentos = destinatario.intentos + 1;
    await this.repoDestinatario.save(destinatario);
  }

  async updateDestinatarioEnviado(idDestinatario: number) {
    const destinatario = await this.repoDestinatario.findOne({
      where: { id: idDestinatario },
    });
    if (!destinatario) {
      throw new NotFoundException('Destinatario no encontrado');
    }

    const enviado = await this.repoEstado.findOne({
      where: { nombre: 'Enviado' },
    });

    if (!enviado) {
      throw new NotFoundException('Estado no encontrado');
    }

    destinatario.estado = enviado;
    await this.repoDestinatario.save(destinatario);
  }
}
