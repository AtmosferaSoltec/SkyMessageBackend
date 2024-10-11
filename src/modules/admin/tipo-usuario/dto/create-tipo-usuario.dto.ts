import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTipoUsuarioDto {
  @IsString({ message: 'El nombre debe ser un string' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;
}
