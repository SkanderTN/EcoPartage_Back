// src/messages/entities/message.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderId: string;

  @Column()
  receiverId: string;

  @Column()
  content: string;

  @CreateDateColumn()
  timestamp: Date;
}
