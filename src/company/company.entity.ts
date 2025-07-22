import { ChildEntity, Column } from 'typeorm';
import { User } from '../user/user.entity/user.entity';

@ChildEntity()
export class Company extends User {
  @Column()
  nameCompany: string;

  @Column()
  contactPhone: number;
}