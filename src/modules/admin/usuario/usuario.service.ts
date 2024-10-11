import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Not, Repository } from 'typeorm';
import { TipoUsuarioService } from '../tipo-usuario/tipo-usuario.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,

    private readonly tipoUsuarioService: TipoUsuarioService,
  ) {}

  async create(dto: CreateUsuarioDto) {
    // Verificar si el user ya existe
    const find = await this.repo.findOne({ where: { user: dto.user } });
    if (find) {
      throw new ConflictException('Usuario ya existe');
    }

    const tipoUsuario = await this.tipoUsuarioService.findOne(
      dto.idTipoUsuario,
    );
    if (!tipoUsuario.activo) {
      throw new ConflictException('Tipo de usuario inactivo');
    }

    const hashPassword = await bcrypt.hash(dto.password, 10);

    const usuario = this.repo.create({
      ...dto,
      tipoUsuario,
      password: hashPassword,
    });
    try {
      await this.repo.save(usuario);
      return await this.findOne(usuario.id);
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException('Error al guardar el usuario');
    }
  }

  async findAll() {
    const list = await this.repo.find({ relations: ['tipoUsuario'] });
    const listFiltro = list.filter((usuario) => usuario.tipoUsuario?.activo);
    const listMap = listFiltro.map((usuario) => {
      delete usuario.password;
      return { ...usuario, tipoUsuario: usuario.tipoUsuario.nombre };
    });
    return listMap;
  }

  async findOnePlane(id: number) {
    const usuario = await this.repo.findOne({
      where: { id },
      relations: ['tipoUsuario'],
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (!usuario.tipoUsuario?.activo) {
      throw new ConflictException('Tipo de usuario inactivo');
    }
    delete usuario.password;
    return { ...usuario, tipoUsuario: usuario.tipoUsuario.nombre };
  }

  async findOne(id: number) {
    const usuario = await this.repo.findOne({
      where: { id },
      relations: ['tipoUsuario'],
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  async findByUser(user: string) {
    const usuario = await this.repo.findOne({
      where: { user },
      relations: ['tipoUsuario'],
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (!usuario.tipoUsuario.activo) {
      throw new ConflictException('Tipo de usuario inactivo');
    }
    return usuario;
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    await this.findOne(id);

    const findUser = await this.repo.findOne({
      where: { user: dto.user, id: Not(id) },
    });
    if (findUser) {
      throw new ConflictException('Usuario ya existe');
    }

    const tipoUsuario = await this.tipoUsuarioService.findOne(
      dto.idTipoUsuario,
    );
    if (!tipoUsuario.activo) {
      throw new ConflictException('Tipo de usuario inactivo');
    }

    try {
      const usuarioUpdated = await this.repo.preload({
        id,
        ...dto,
        tipoUsuario,
      });
      await this.repo.save(usuarioUpdated);
      return await this.findOnePlane(usuarioUpdated.id);
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar el usuario');
    }
  }

  async remove(id: number) {
    const usuario = await this.findOne(id);
    usuario.activo = false;
    await this.repo.save(usuario);
    return await this.findOnePlane(id);
  }

  async restore(id: number) {
    const usuario = await this.findOne(id);
    usuario.activo = true;
    await this.repo.save(usuario);
    return await this.findOnePlane(id);
  }
}
