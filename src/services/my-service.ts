import { Injectable } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { EnvioService } from "src/modules/envio/envio.service";
import { WhatsappService } from "src/modules/whatsapp/whatsapp.service";

@Injectable()
export class MyService {
  constructor(
    private readonly envioService: EnvioService,
    private readonly whatsappService: WhatsappService
  ) {}

  @Interval(30000)
  async handleInterval() {
    try {
      let envio = await this.envioService.findNumberEnvios(30);

      if (!envio) {
        return;
      }

      this.whatsappService.send(envio);
    } catch (error) {
      console.log(error?.message);
    }
  }
}
