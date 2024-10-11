import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Destinatario } from "./destinatario.entity";

@Entity({ name: 'estado-destinatario' })
export class EstadoDestinatario {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 50,
        unique: true
    })
    nombre: string;

    @OneToMany(() => Destinatario, des => des.estado)
    destinatarios: Destinatario[]

}