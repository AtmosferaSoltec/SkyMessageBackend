import { Envio } from 'src/modules/envio/entities/envio.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TipoUsuario } from '../../tipo-usuario/entities/tipo-usuario.entity';
import { Plantilla } from '../../plantilla/entities/plantilla.entity';

@Entity({ name: 'usuario' })
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100
  })
  nombre: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    unique: true
  })
  user: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false
  })
  password: string;

  @Column({
    type: 'varchar'
  })
  instance: string;

  @Column({
    type: 'varchar'
  })
  token: string;

  @Column({
    type: 'boolean',
    default: true
  })
  activo: boolean;

  @OneToMany(() => Envio, (envio) => envio.usuario)
  envios: Envio[];

  @ManyToOne(
    () => TipoUsuario,
    (tp) => tp.usuarios
  )
  tipoUsuario: TipoUsuario;

  @OneToMany(
    () => Plantilla,
    (p) => p.usuario,
  )
  plantillas: Plantilla[];
  
}
