import { IsNotEmpty, IsString } from "class-validator";

export class TokenDto {
  
    @IsString({ message: 'Debe ser un string' })
    @IsNotEmpty({ message: 'No puede estar vacío' })
    token: string;
  }
  