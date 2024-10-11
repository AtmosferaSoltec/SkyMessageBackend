import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuarioModule } from '../admin/usuario/usuario.module';
import { JwtModule } from '@nestjs/jwt';
import { constants } from 'src/config/constants';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: constants.jwtSecret,
      signOptions: { expiresIn: '4h' },
    }),
    UsuarioModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
