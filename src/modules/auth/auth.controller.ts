import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('validar-token')
  @HttpCode(200)
  validarToken(@Body() dto: TokenDto) {
    return this.authService.validarToken(dto);
  }

  @UseGuards(AuthGuard)
  @Get('is-admin')
  isAdmin(@Req() req: Request) {
    const { id } = req['user'];
    return this.authService.isAdmin(id);
  }

  @UseGuards(AuthGuard)
  @Post("change-password")
  changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
    const { id } = req['user'];
    return this.authService.changePassword(id, dto);
  }
}
