import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AppGateway } from './app.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantillaModule } from './modules/admin/plantilla/plantilla.module';
import { UsuarioModule } from './modules/admin/usuario/usuario.module';
import { EnvioModule } from './modules/envio/envio.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MyService } from './services/my-service';
import { HttpModule } from '@nestjs/axios';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { TipoUsuarioModule } from './modules/admin/tipo-usuario/tipo-usuario.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    HttpModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsuarioModule,
    PlantillaModule,
    EnvioModule,
    WhatsappModule,
    TipoUsuarioModule,
    AuthModule,
  ],
  controllers: [],
  providers: [AppGateway, MyService],
})
export class AppModule {}
