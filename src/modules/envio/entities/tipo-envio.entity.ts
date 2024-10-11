import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Envio } from './envio.entity';

@Entity({ name: 'tipo-envio' })
export class TipoEnvio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  nombre: string;

  @OneToMany(() => Envio, (env) => env.tipoEnvio)
  envios: Envio[];
}
