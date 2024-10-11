import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuarioService } from 'src/modules/admin/usuario/usuario.service';



@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly service: UsuarioService
  ){

  }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request['user'];
    const usuario = await this.service.findOne(user.id);
    if (usuario.tipoUsuario.nombre === 'Admin') {
      return true;
    } else {
      throw new UnauthorizedException('No tienes permisos para acceder a este recurso');
    }
  }
}