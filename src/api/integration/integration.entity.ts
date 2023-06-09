import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Integration extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ type: 'varchar', unique: true, nullable: true })
  public integrationId?: string;

  @Column({ type: 'varchar' })
  public cxoneClientId: string;

  @Column({ type: 'varchar' })
  public cxoneClientSecret: string;

  @ManyToOne(
    () => User,
    (user) => {
      user.integration;
    },
  )
  public user: User;
}
