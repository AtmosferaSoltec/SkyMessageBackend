import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlantillaDto } from './dto/create-plantilla.dto';
import { UpdatePlantillaDto } from './dto/update-plantilla.dto';
import { Not, Repository } from 'typeorm';
import { Plantilla } from './entities/plantilla.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class PlantillaService {
  constructor(
    @InjectRepository(Plantilla)
    private readonly repo: Repository<Plantilla>,

    private readonly repoUsuario: UsuarioService,
  ) {}

  async create(dto: CreatePlantillaDto, idUser: number) {
    const usuario = await this.repoUsuario.findOne(idUser);
    const find = await this.repo.findOne({ where: { titulo: dto.titulo } });
    if (find) {
      throw new ConflictException(
        `Plantilla con titulo ${dto.titulo} ya existe`,
      );
    }
    try {
      const plantilla = this.repo.create({ ...dto, usuario });
      await this.repo.save(plantilla);
      return await this.findOne(plantilla.id);
    } catch (error) {
      throw new InternalServerErrorException(`Error al guardar la plantilla`);
    }
  }

  async findAll() {
    return await this.repo.find();
  }

  async findList(id: number) {
    return await this.repo.find({ where: { usuario: { id } } });
  }

  async findOne(id: number) {
    const plantilla = await this.repo.findOne({ where: { id } });
    if (!plantilla) {
      throw new NotFoundException(`Plantilla #${id} no encontrada`);
    }
    return plantilla;
  }

  async update(id: number, dto: UpdatePlantillaDto, idUsuario: number) {
    await this.findOne(id);

    const find = await this.repo.findOne({
      where: { titulo: dto.titulo, id: Not(id), usuario: { id: idUsuario } },
    });
    if (find) {
      throw new ConflictException(
        `Plantilla con titulo ${dto.titulo} ya existe`,
      );
    }
    try {
      const updated = await this.repo.preload({ id, ...dto });
      await this.repo.save(updated);
      return await this.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al actualizar la plantilla`,
      );
    }
  }

  async remove(id: number) {
    const plantilla = await this.findOne(id);
    if (plantilla.activo) {
      plantilla.activo = false;
      await this.repo.save(plantilla);
    } else {
      await this.repo.remove(plantilla);
    }
    return;
  }

  async restore(id: number) {
    const plantilla = await this.findOne(id);
    plantilla.activo = true;
    await this.repo.save(plantilla);
    return await this.findOne(id);
  }
}
