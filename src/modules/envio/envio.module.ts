import { Module } from "@nestjs/common";
import { EnvioService } from "./envio.service";
import { EnvioController } from "./envio.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Destinatario } from "./entities/destinatario.entity";
import { Envio } from "./entities/envio.entity";
import { EstadoDestinatario } from "./entities/estado-destinatario.entity";
import { UsuarioModule } from "../admin/usuario/usuario.module";
import { TipoEnvio } from "./entities/tipo-envio.entity";
import { EstadoEnvio } from "./entities/estado-envio.entity";

@Module({
  imports: [
    UsuarioModule,
    TypeOrmModule.forFeature([
      Envio,
      EstadoEnvio,
      Destinatario,
      EstadoDestinatario,
      TipoEnvio,
    ]),
  ],
  exports: [EnvioService],
  controllers: [EnvioController],
  providers: [EnvioService],
})
export class EnvioModule {}
