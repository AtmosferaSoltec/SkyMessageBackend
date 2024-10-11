import { Type } from "class-transformer";
import { IsArray, ValidateNested, IsString, IsNotEmpty, IsNumber } from "class-validator";

export class CreateEnvioDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateDestinatarioDto)
    destinatarios: CreateDestinatarioDto[];
  
    @IsString()
    @IsNotEmpty()
    mensaje: string;

    @IsNumber()
    @IsNotEmpty()
    tipoEnvio: number;
  }
  
  export class CreateDestinatarioDto {
    @IsString({ message: 'El mensaje debe ser un texto' })
    nombre: string;
  
    @IsString()
    telf: string;
  }
  