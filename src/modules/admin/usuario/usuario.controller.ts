import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, ConflictException } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { AdminGuard } from 'src/guards/admin.guard';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  //@UseGuards(AuthGuard, AdminGuard)
  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  //@UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.usuarioService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    if (isNaN(+id)) {
      throw new ConflictException('El id debe ser un número');
    }
    return this.usuarioService.findOnePlane(+id);
  }

  //@UseGuards(AuthGuard, AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    if (isNaN(+id)) {
      throw new ConflictException('El id debe ser un número');
    }
    return this.usuarioService.update(+id, updateUsuarioDto);
  }

  //@UseGuards(AuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    if (isNaN(+id)) {
      throw new ConflictException('El id debe ser un número');
    }
    return this.usuarioService.remove(+id);
  }

  //@UseGuards(AuthGuard)
  @Put(':id')
  restore(@Param('id') id: string) {
    if (isNaN(+id)) {
      throw new ConflictException('El id debe ser un número');
    }
    return this.usuarioService.restore(+id);
  }
}
