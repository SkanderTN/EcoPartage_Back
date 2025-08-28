// src/cart/dto/update-cart-item.dto.ts
import { IsNumber, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCartItemDto {
  @IsNotEmpty({ message: 'La quantité est requise' })
  @Type(() => Number)
  @IsNumber({}, { message: 'La quantité doit être un nombre' })
  @Min(1, { message: 'La quantité doit être d\'au moins 1' })
  quantity: number;
}