import { Controller, Get, Post, Body, Patch, Param, Delete, ConflictException, Put, UseGuards, Req } from '@nestjs/common';
import { PlantillaService } from './plantilla.service';
import { CreatePlantillaDto } from './dto/create-plantilla.dto';
import { UpdatePlantillaDto } from './dto/update-plantilla.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { request } from 'http';

@Controller('plantilla')
export class PlantillaController {
  constructor(private readonly plantillaService: PlantillaService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto: CreatePlantillaDto, @Req() request: Request) {
    const { id } = request['user']
    if (isNaN(+id)) {
      throw new ConflictException('El id debe ser un número');
    }
    return this.plantillaService.create(dto, id);
  }

  @Get('all')
  findAll() {
    return this.plantillaService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get()
  findList(@Req() request: Request) {
    const { id } = request['user']
    if (isNaN(+id)) {
      throw new ConflictException('El id debe ser un número');
    }
    return this.plantillaService.findList(id);
  }


  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    if (isNaN(+id)) {
      throw new ConflictException('El id debe ser un número');
    }
    return this.plantillaService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() request: Request,
    @Body() dto: UpdatePlantillaDto
  ) {
    if (isNaN(+id)) {
      throw new ConflictException('El id debe ser un número');
    }

    const user = request['user']
    if (isNaN(+user.id)) {
      throw new ConflictException('El idUsuario debe ser un número');
    }

    return this.plantillaService.update(+id, dto, user.id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    if (isNaN(+id)) {
      throw new ConflictException('El id debe ser un número');
    }
    return this.plantillaService.remove(+id);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  restore(@Param('id') id: string) {
    if (isNaN(+id)) {
      throw new ConflictException('El id debe ser un número');
    }
    return this.plantillaService.restore(+id);
  }
}
