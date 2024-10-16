import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Destinatario } from "./destinatario.entity";
import { Envio } from "./envio.entity";

@Entity("estado-envio")
export class EstadoEnvio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "varchar",
    length: 50,
    unique: true,
  })
  nombre: string;

  @OneToMany(() => Envio, (e) => e.estado)
  envios: Envio[];
}
