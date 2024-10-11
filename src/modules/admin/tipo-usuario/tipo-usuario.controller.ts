import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ConflictException,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TipoUsuarioService } from './tipo-usuario.service';
import { CreateTipoUsuarioDto } from './dto/create-tipo-usuario.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { AdminGuard } from 'src/guards/admin.guard';

@Controller('tipo-usuario')
export class TipoUsuarioController {
  constructor(private readonly tipoUsuarioService: TipoUsuarioService) {}

  @Post()
  create(@Body() dto: CreateTipoUsuarioDto) {
    return this.tipoUsuarioService.create(dto);
  }

  @Get()
  findAll() {
    return this.tipoUsuarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    if (isNaN(+id)) {
      throw new ConflictException('El id debe ser un número');
    }
    return this.tipoUsuarioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateTipoUsuarioDto) {
    if (isNaN(+id)) {
      throw new ConflictException('El id debe ser un número');
    }
    return this.tipoUsuarioService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    if (isNaN(+id)) {
      throw new ConflictException('El id debe ser un número');
    }
    return this.tipoUsuarioService.remove(+id);
  }


  @Put(':id')
  restore(@Param('id') id: string) {
    if (isNaN(+id)) {
      throw new ConflictException('El id debe ser un número');
    }
    return this.tipoUsuarioService.restore(+id);
  }
}
