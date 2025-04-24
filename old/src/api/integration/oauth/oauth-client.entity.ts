import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OAuthClient extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ type: 'varchar' })
  public clientId: string;

  @Column({ type: 'varchar' })
  public clientSecret: string;
}

// User experience
// Create an integration with the middleware
// - Accept the client ID and secret used to access CXone
// - optionally accept the integration Id.
// Provide back the integration details to the user
// - THe urls
// - the generated client id / secret
