import { Type } from "class-transformer";
import { IsArray, ValidateNested, IsString, IsNotEmpty, IsNumber, IsIn } from "class-validator";

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
    @IsIn([1, 2, 3], { message: 'Solo se permiten los valores (1) Mensaje, (2) Imagen, (3) Pdf' })
    tipoEnvio: number;

    @IsString()
    urlArchivo: string;
  }
  
  export class CreateDestinatarioDto {
    @IsString({ message: 'El mensaje debe ser un texto' })
    nombre: string;
  
    @IsString()
    telf: string;
  }
  