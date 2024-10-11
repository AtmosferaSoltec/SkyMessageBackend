import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateUsuarioDto {

    @IsString({ message: 'El nombre debe ser un string' })
    @IsNotEmpty({ message: 'El nombre es requerido' })
    nombre: string;

    @IsString({ message: 'El usuario debe ser un string' })
    @IsNotEmpty({ message: 'El usuario es requerido' })
    user: string;

    @IsString({ message: 'La contraseña debe ser un string' })
    @IsNotEmpty({ message: 'La contraseña es requerida' })
    password: string;

    @IsString({ message: 'La instancia debe ser un string' })
    instance: string;

    @IsString({ message: 'El token debe ser un string' })
    token: string;

    @IsNotEmpty({ message: 'El idTipoUsuario es requerido' })
    @IsNumber({}, { message: 'El idTipoUsuario debe ser un número' })
    idTipoUsuario: number;

}
