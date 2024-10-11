import { IsNotEmpty, IsString } from "class-validator";

export class CreatePlantillaDto {
    @IsString({ message: "El titulo debe ser un texto" })
    @IsNotEmpty({ message: "El titulo es requerido" })
    titulo: string;

    @IsString({ message: "El cuerpo debe ser un texto" })
    @IsNotEmpty({ message: "El cuerpo es requerido" })
    cuerpo: string;
}
