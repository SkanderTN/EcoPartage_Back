import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';


export enum PostType {
  FREE = 'free',
  PAID = 'paid',
}

export enum PostCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  USED = 'used',
  DAMAGED = 'damaged',
  EXPIRED = 'expired',
}

export enum PostStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class Quantity {
  @Column('int')
  value: number;

  @Column()
  unit: string;
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: PostType,
    default: PostType.FREE,
  })
  type: PostType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column(type => Quantity)
  quantity: Quantity;

  @Column({
    type: 'enum',
    enum: PostCondition,
    default: PostCondition.USED,
  })
  condition: PostCondition;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.AVAILABLE,
  })
  status: PostStatus;

  // Photos
  @Column({ nullable: true })
  mainPhoto: string;

  @Column('simple-array', { nullable: true })
  additionalPhotos: string[]; // Maximum 4

  // Localisation structurée
  @Column({ nullable: true })
  street: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ nullable: true })
  neighborhood: string; // Quartier

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}  