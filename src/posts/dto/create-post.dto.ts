import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, Min, IsArray, ArrayMaxSize, IsUUID } from 'class-validator';
import { PostType, PostCondition } from '../entities/post.entity';
import { Type } from 'class-transformer';

export class QuantityDto {
  @IsNumber()
  @Min(1)
  value: number;

  @IsString()
  @IsNotEmpty()
  unit: string; // ex: "unités", "kg", "L", etc.
}


export class CreatePostDto {
  
  @IsString()
  @IsNotEmpty()  
  title: string;

  @IsString()
  @IsOptional()
  description: string;
  
  @IsEnum(PostType)
  type?: PostType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @Type(() => QuantityDto)
  @IsNotEmpty()
  quantity: QuantityDto;
  

  @IsEnum(PostCondition)
  condition?: PostCondition;

  // Photos
  @IsString()
  @IsOptional()
  mainPhoto?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(4)
  @IsOptional()  
  additionalPhotos?: string[];

  // Localisation
  @IsString()
  @IsOptional()  
  street?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsOptional()  
  postalCode?: string;
  
  @IsString()
  @IsOptional()  
  neighborhood?: string;

  // Category
  @IsUUID()
  @IsOptional()
  categoryId?: string;
}