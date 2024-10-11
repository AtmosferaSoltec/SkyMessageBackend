import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { HttpModule } from '@nestjs/axios';
import { UsuarioModule } from '../admin/usuario/usuario.module';
import { EnvioModule } from '../envio/envio.module';

@Module({
  imports: [HttpModule, UsuarioModule, EnvioModule],
  exports: [WhatsappService],
  controllers: [WhatsappController],
  providers: [WhatsappService],
})
export class WhatsappModule {}
