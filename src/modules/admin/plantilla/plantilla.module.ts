import { Module } from '@nestjs/common';
import { PlantillaService } from './plantilla.service';
import { PlantillaController } from './plantilla.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plantilla } from './entities/plantilla.entity';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [TypeOrmModule.forFeature([Plantilla]), UsuarioModule],
  controllers: [PlantillaController],
  providers: [PlantillaService],
})
export class PlantillaModule {}
