import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Usuario } from "../../usuario/entities/usuario.entity";

@Entity({
    name: "tipo_usuario"
})
export class TipoUsuario {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "varchar",
        length: 50,
        nullable: false,
        unique: true
    })
    nombre: string;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP"
    })
    created_at: Date;

    @Column({
        type: "boolean",
        default: true
    })
    activo: boolean;
    
    @OneToMany(
        () => Usuario,
        (usuario) => usuario.tipoUsuario
    )
    usuarios: Usuario[];
}
