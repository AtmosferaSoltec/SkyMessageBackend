import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { httpsCertificate } from './config/https-certificate';

async function bootstrap() {
  // Es una Prueba ELIMINAR
  const app = await NestFactory.create(AppModule, {
    httpsOptions: httpsCertificate(),
  });
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  app.setGlobalPrefix('api');
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();
