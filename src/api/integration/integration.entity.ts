import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { OAuthClient } from './oauth/oauth-client.entity';

const baseDomain = 'e85a-159-196-229-34.ngrok-free.app';

@Entity()
export class Integration extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  public integrationId?: string;

  @Column({ type: 'varchar' })
  public cxoneClientId: string;

  @Column({ type: 'varchar' })
  public cxoneClientSecret: string;

  @ManyToOne(
    (type) => User,
    (user) => {
      user.integrations;
    },
  )
  @JoinColumn({ name: 'id_user' })
  public user: User;

  @OneToOne(() => OAuthClient)
  @JoinColumn()
  oauthClient: OAuthClient;

  get integrationBoxUrl() {
    return `https://${baseDomain}/api/v1/integration/${this.id}/box`;
  }
  get addActionUrl() {
    return `https://${baseDomain}/api/v1/integration/${this.id}/action`;
  }
  get reconnectActionUrl() {
    return `https://${baseDomain}/api/v1/integration/${this.id}/reconnect`;
  }
  get removeActionUrl() {
    return `https://${baseDomain}/api/v1/integration/${this.id}/remove`;
  }
}

// User experience
// Create an integration with the middleware
// - Accept the client ID and secret used to access CXone
// - optionally accept the integration Id.
// Provide back the integration details to the user
// - THe urls
// - the generated client id / secret
