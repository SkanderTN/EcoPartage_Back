// src/cart/dto/add-to-cart.dto.ts
import { IsNumber, IsUUID, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @IsNotEmpty({ message: 'L\'ID du produit est requis' })
  @IsUUID('4', { message: 'L\'ID du produit doit être un UUID valide' }) 
  productId: string;

  @IsNotEmpty({ message: 'La quantité est requise' })
  @Type(() => Number)
  @IsNumber({}, { message: 'La quantité doit être un nombre' })
  @Min(1, { message: 'La quantité doit être d\'au moins 1' })
  quantity: number;
}