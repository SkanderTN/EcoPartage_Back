import { IsOptional, IsString, IsEnum, IsNumber, Min, IsInt, IsUUID } from 'class-validator';
import { PostType, PostCondition, PostStatus } from '../entities/post.entity';
import { Type } from 'class-transformer';

export class FilterPostDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @IsOptional()
  @IsEnum(PostCondition)
  condition?: PostCondition;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  q?: string; // recherche sur titre/description

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
  
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
