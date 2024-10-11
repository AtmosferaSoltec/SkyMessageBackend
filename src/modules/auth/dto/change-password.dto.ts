import { IsNotEmpty, IsString } from "class-validator";

export class ChangePasswordDto {
  @IsString({ message: "Debe ser un string" })
  @IsNotEmpty({ message: "No puede estar vacío" })
  oldPassword: string;

  @IsString({ message: "Debe ser un string" })
  @IsNotEmpty({ message: "No puede estar vacío" })
  newPassword: string;
}
