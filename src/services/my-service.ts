import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';
import { EnvioService } from 'src/modules/envio/envio.service';
import { WhatsappService } from 'src/modules/whatsapp/whatsapp.service';

@Injectable()
export class MyService {
  constructor(
    private readonly envioService: EnvioService,
    private readonly whatsappService: WhatsappService,
    private readonly http: HttpService,
  ) {}

  @Interval(60000)
  async handleInterval() {
    try {
      let envio = await this.envioService.find10Envios();
      this.whatsappService.sendEnvios(envio)
    } catch (error) {
      console.log(error?.message);
    }
  }
}
