import { ChildEntity, Column } from 'typeorm';
import { User } from '../user/user.entity/user.entity';

@ChildEntity()
export class Association extends User {
  @Column()
  nameAsso: string;

  @Column()
  contactPhone: number;
}
