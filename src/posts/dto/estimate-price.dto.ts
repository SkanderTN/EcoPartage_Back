import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PostCondition } from '../entities/post.entity';

export class EstimatePriceDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  quantity?: {
    value: string;
    unit: string;
  };

  @IsEnum(PostCondition)
  condition: PostCondition;

  @IsString()
  mainPhotoBase64: string;

  @IsOptional()
  additionalPhotosBase64?: string[];
}