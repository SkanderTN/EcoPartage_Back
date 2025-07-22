import { ChildEntity } from 'typeorm';
import { User } from '../user/user.entity/user.entity';

@ChildEntity()
export class SimpleUser extends User {
}