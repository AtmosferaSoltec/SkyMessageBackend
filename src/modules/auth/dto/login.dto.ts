import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Debe ser un string' })
  @IsNotEmpty({ message: 'No puede estar vacío' })
  user: string;

  @IsString({ message: 'Debe ser un string' })
  @IsNotEmpty({ message: 'No puede estar vacío' })
  password: string;
}
