// src/cart/cart.entity.ts
import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, Column } from 'typeorm';
import { User } from '../user/entities/user.entity'; 
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ✅ Relation One-to-One avec l'utilisateur (relation unidirectionnelle)
  // Un utilisateur a un seul panier, et un panier appartient à un seul utilisateur.
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  // Relation One-to-Many avec les articles du panier
  // Un panier peut avoir plusieurs articles.
  @OneToMany(() => CartItem, cartItem => cartItem.cart, { cascade: true, eager: true })
  items: CartItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPrice: number;
}