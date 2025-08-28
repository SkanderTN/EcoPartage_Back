import { Entity, PrimaryGeneratedColumn, Column, TableInheritance, OneToMany } from 'typeorm';
import { UserRole } from '../dto/register-user.dto'; 
import { Post } from '../../posts/entities/post.entity';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'role' } })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar' })
  role: UserRole;

  @Column({ nullable: true, type: 'varchar' })
  profilePicture: string | null;

  @OneToMany(() => Post, post => post.user) 
  posts: Post[]; 
}
