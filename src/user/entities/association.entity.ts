import { ChildEntity, Column } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from '../dto/register-user.dto';

@ChildEntity(UserRole.ASSOCIATION)
export class Association extends User {
  @Column()
  nameAsso: string;

  @Column()
  contactPhone: number;
}
