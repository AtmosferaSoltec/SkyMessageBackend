import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { TipoUsuarioModule } from '../tipo-usuario/tipo-usuario.module';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario]), TipoUsuarioModule],
  exports: [UsuarioService],
  controllers: [UsuarioController],
  providers: [UsuarioService],
})
export class UsuarioModule {}
