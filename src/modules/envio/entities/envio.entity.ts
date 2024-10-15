import { Usuario } from 'src/modules/admin/usuario/entities/usuario.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Destinatario } from './destinatario.entity';
import { TipoEnvio } from './tipo-envio.entity';

@Entity({ name: 'envio' })
export class Envio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  correlativo: number;

  @Column({
    type: 'text',
    nullable: false,
  })
  mensaje: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  urlArchivo: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @ManyToOne(() => Usuario, (usr) => usr.envios)
  usuario: Usuario;

  @ManyToOne(() => TipoEnvio, (te) => te.envios)
  tipoEnvio: TipoEnvio;

  @OneToMany(() => Destinatario, (dest) => dest.envio)
  destinatarios: Destinatario[];
}
