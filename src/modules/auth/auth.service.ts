import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsuarioService } from '../admin/usuario/usuario.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UsuarioService,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.userService.findByUser(dto.user);

    const isMatch = await bcrypt.compare(dto.password, usuario.password);

    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { id: usuario.id, nombre: usuario.nombre };
    const token = await this.jwtService.signAsync(payload);
    return {
      access_token: token,
      token_type: 'bearer',
    };
  }

  validarToken(dto: { token: string }) {
    try {
      return this.jwtService.verify(dto.token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async isAdmin(id: number) {
    const user = await this.userService.findOne(id);
    return user.tipoUsuario.nombre === 'Admin'
  }
  
}
