import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @UseGuards(AuthGuard)
  @Get('qr')
  getQR(@Req() request: Request) {
    const { id } = request['user'];
    return this.whatsappService.getQR(id);
  }

  @UseGuards(AuthGuard)
  @Get('estado')
  getEstado(@Req() request: Request) {
    const { id } = request['user'];
    return this.whatsappService.getEstado(id);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  @HttpCode(200)
  logout(@Req() request: Request) {
    const { id } = request['user'];
    return this.whatsappService.logout(id);
  }

  @UseGuards(AuthGuard)
  @Get('perfil')
  perfil(@Req() request: Request) {
    const { id } = request['user'];
    return this.whatsappService.getPerfil(id)
  }

}
