import { IsString, IsOptional, IsEnum, IsIn } from 'class-validator';
import { PostCondition } from '../entities/post.entity';

export class SuggestFieldDto {
  @IsIn(['title', 'description', 'quantity'])
  fieldType: 'title' | 'description' | 'quantity';

  @IsString()
  mainPhotoBase64: string;

  @IsOptional()
  @IsString()
  existingTitle?: string;

  @IsOptional()
  @IsString()
  existingDescription?: string;

  @IsOptional()
  quantity?: {
    value: string;
    unit: string;
  };

  @IsOptional()
  @IsEnum(PostCondition)
  condition?: PostCondition;
}