import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { EstadoDestinatario } from './estado-destinatario.entity';
import { Envio } from './envio.entity';

@Entity({ name: 'destinatario' })
export class Destinatario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  nombre?: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  telf: string;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  intentos: number;

  @ManyToOne(() => Envio, (e) => e.destinatarios)
  envio: Envio;

  @ManyToOne(() => EstadoDestinatario, (e) => e.destinatarios, { eager: true })
  estado: EstadoDestinatario;
}
