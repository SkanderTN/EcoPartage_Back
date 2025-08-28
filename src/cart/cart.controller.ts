// src/cart/cart.controller.ts
import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Delete,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../user/entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('cart')
@UseGuards(AuthGuard('jwt'))
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@GetUser() user: User) {
    try {
      const userId = user.id || user['userId'];
      return await this.cartService.getCartByUserId(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération du panier',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async addToCart(
    @GetUser() user: User,
    @Body(ValidationPipe) addToCartDto: AddToCartDto,
  ) {
    try {
      const userId = user.id || user['userId'];
      return await this.cartService.addToCart(userId, addToCartDto);
    } catch (error) {
      throw new HttpException(
        error.message || "Erreur lors de l'ajout au panier",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':itemId')
  async updateCartItem(
    @GetUser() user: User,
    @Param('itemId') itemId: string,
    @Body(ValidationPipe) updateCartItemDto: UpdateCartItemDto,
  ) {
    try {
      const userId = user.id || user['userId'];
      return await this.cartService.updateCartItem(
        userId,
        itemId,
        updateCartItemDto,
      );
    } catch (error) {
      throw new HttpException(
        error.message || "Erreur lors de la mise à jour de l'article",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':itemId')
  async removeCartItem(@GetUser() user: User, @Param('itemId') itemId: string) {
    try {
      const userId = user.id || user['userId'];
      return await this.cartService.removeCartItem(userId, itemId);
    } catch (error) {
      throw new HttpException(
        error.message || "Erreur lors de la suppression de l'article",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete()
  async clearCart(@GetUser() user: User) {
    try {
      const userId = user.id || user['userId'];
      return await this.cartService.clearCart(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la suppression du panier',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
