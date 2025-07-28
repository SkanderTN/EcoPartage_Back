import { ChildEntity } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from '../dto/register-user.dto'; 


@ChildEntity(UserRole.SIMPLE)
export class SimpleUser extends User {
}