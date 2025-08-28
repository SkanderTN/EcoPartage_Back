// src/cart/cart.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { User } from '../user/entities/user.entity'; 
import { Post } from '../posts/entities/post.entity';
import { CartItem } from './cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User) // ✅ Ajout du repository User
    private readonly userRepository: Repository<User>,
  ) {}

  async getCartByUserId(userId: number): Promise<Cart | null> {
    return await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'user'],
    });
  }

  async getOrCreateCartByUserId(userId: number): Promise<Cart> {
    let cart = await this.getCartByUserId(userId);

    // ✅ Créer automatiquement un panier si il n'existe pas
    if (!cart) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé.');
      }
      cart = await this.createCartForUser(user);
    }

    return cart;
  }

  async createCartForUser(user: User): Promise<Cart> {
    const newCart = this.cartRepository.create({ 
      user, 
      items: [],
      totalPrice: 0 
    });
    return this.cartRepository.save(newCart);
  }

  async addToCart(userId: number, addToCartDto: AddToCartDto): Promise<Cart> {
    const { productId, quantity } = addToCartDto;

    if (quantity <= 0) {
      throw new BadRequestException('La quantité doit être supérieure à 0.');
    }

    // Utiliser getCartByUserId qui crée automatiquement le panier si nécessaire
    const cart = await this.getOrCreateCartByUserId(userId);

    const post = await this.postRepository.findOne({ where: { id: productId } });
    if (!post) {
      throw new NotFoundException('Produit non trouvé.');
    }

    // Vérifier si l'article existe déjà dans le panier
    const existingItem = cart.items.find(item => item.product.id === productId);

    if (existingItem) {
      // Si l'article existe, mettre à jour la quantité
      existingItem.quantity += quantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      // Sinon, créer un nouvel article
      const newItem = this.cartItemRepository.create({
        cart,
        product: post,
        quantity,
      });
      await this.cartItemRepository.save(newItem);
    }
 
    const updatedCart = await this.getOrCreateCartByUserId(userId);


    // Mettre à jour le prix total
    await this.updateCartTotalPrice(updatedCart);
    return this.getOrCreateCartByUserId(userId);
  }

  async updateCartItem(userId: number, itemId: string, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
    const { quantity } = updateCartItemDto;

    if (quantity <= 0) {
      throw new BadRequestException('La quantité doit être supérieure à 0.');
    }

    const cart = await this.getOrCreateCartByUserId(userId);

    const itemToUpdate = cart.items.find(item => item.id === itemId);

    if (!itemToUpdate) {
      throw new NotFoundException('Article du panier non trouvé.');
    }

    itemToUpdate.quantity = quantity;
    await this.cartItemRepository.save(itemToUpdate);

    // Mettre à jour le prix total
    await this.updateCartTotalPrice(cart);
    return this.getOrCreateCartByUserId(userId);
  }

  async removeCartItem(userId: number, itemId: string): Promise<Cart> {
    const cart = await this.getOrCreateCartByUserId(userId);

    const itemToRemove = cart.items.find(item => item.id === itemId);

    if (!itemToRemove) {
      throw new NotFoundException('Article du panier non trouvé.');
    }

    await this.cartItemRepository.remove(itemToRemove);

    // Recharger le panier pour obtenir les items mis à jour
    const updatedCart = await this.getOrCreateCartByUserId(userId);
    await this.updateCartTotalPrice(updatedCart);
    
    return this.getOrCreateCartByUserId(userId);
  }

  async clearCart(userId: number): Promise<Cart> {
  // ✅ UN SEUL appel pour récupérer le panier avec relations
  const cart = await this.cartRepository.findOne({
    where: { user: { id: userId } },
    relations: ['items', 'user'],
  });

  if (!cart) {
    // Créer un panier vide si inexistant
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }
    return this.createCartForUser(user);
  }

  // ✅ Vider seulement si il y a des items
  if (cart.items && cart.items.length > 0) {
    // Supprimer tous les items
    await this.cartItemRepository.remove(cart.items);
  }

  // ✅ Mettre à jour le panier en une fois
  cart.items = [];
  cart.totalPrice = 0;
  
  // ✅ Sauvegarder et retourner directement
  return await this.cartRepository.save(cart);
}
  
  private async updateCartTotalPrice(cart: Cart): Promise<void> {
    const items = await this.cartItemRepository.find({
      where: { cart: { id: cart.id } },
      relations: ['product'],
    });

    const totalPrice = items.reduce((acc, item) => {
      // ✅ Gérer les prix null pour les produits gratuits
      const price = item.product.price || 0;
      return acc + (price * item.quantity);
    }, 0);

    cart.totalPrice = totalPrice;
    await this.cartRepository.save(cart);
  }
}
