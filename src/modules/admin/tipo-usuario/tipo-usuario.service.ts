import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTipoUsuarioDto } from './dto/create-tipo-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TipoUsuario } from './entities/tipo-usuario.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class TipoUsuarioService {
  constructor(
    @InjectRepository(TipoUsuario)
    private readonly repo: Repository<TipoUsuario>,
  ) {}

  async create(dto: CreateTipoUsuarioDto) {
    // Verificar si el tipo de usuario ya existe
    const find = await this.repo.findOne({ where: { nombre: dto.nombre } });

    // Si ya existe, lanzar un error
    if (find) {
      throw new ConflictException(
        `Tipo de usuario con nombre ${dto.nombre} ya existe`,
      );
    }
    // Crear el tipo de usuario
    const tipoUsuario = this.repo.create(dto);

    // Guardar el tipo de usuario
    await this.repo.save(tipoUsuario);

    // Verificar si se guardó correctamente
    if (!tipoUsuario) {
      throw new InternalServerErrorException(
        'Error al crear el tipo de usuario',
      );
    }
    // Retornar el tipo de usuario creado
    return await this.findOne(tipoUsuario.id);
  }

  async findAll() {
    return await this.repo.find();
  }

  async findOne(id: number) {
    const tipoUsuario = await this.repo.findOne({ where: { id } });
    if (!tipoUsuario) {
      throw new NotFoundException(`Tipo de usuario con id ${id} no encontrado`);
    }
    return tipoUsuario;
  }

  async update(id: number, dto: CreateTipoUsuarioDto) {
    // Verificiar si existe el Tipo de usuario
    await this.findOne(id);

    // Verificar si el nombre ya existe
    const find = await this.repo.findOne({
      where: { nombre: dto.nombre, id: Not(id) },
    });

    // Si ya existe, lanzar un error
    if (find) {
      throw new ConflictException(
        `Tipo de usuario con nombre ${dto.nombre} ya existe`,
      );
    }
    // Actualizar el tipo de usuario
    const updated = await this.repo.preload({ id, ...dto });

    if (!updated) {
      throw new InternalServerErrorException(
        `Error al actualizar el tipo de usuario con id ${id}`,
      );
    }

    // Guardar los cambios
    await this.repo.save(updated);

    // Retornar el tipo de usuario actualizado
    return await this.findOne(id);
  }

  async remove(id: number) {
    const tipoUsuario = await this.findOne(id);
    tipoUsuario.activo = false;
    await this.repo.save(tipoUsuario);
    return await this.findOne(id);
  }

  async restore(id: number) {
    const tipoUsuario = await this.findOne(id);
    tipoUsuario.activo = true;
    await this.repo.save(tipoUsuario);
    return await this.findOne(id);
  }
}
