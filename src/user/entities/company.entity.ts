import { ChildEntity, Column } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from '../dto/register-user.dto'; 


@ChildEntity(UserRole.COMPANY)
export class Company extends User {
  @Column()
  nameCompany: string;

  @Column()
  contactPhone: number;
}