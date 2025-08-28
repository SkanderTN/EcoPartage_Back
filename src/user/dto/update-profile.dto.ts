// src/user/dto/update-profile.dto.ts
import { IsEmail, IsString, IsOptional, IsNumber, ValidateIf } from 'class-validator';
import { UserRole } from './register-user.dto';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  // Champs spécifiques aux associations
  @ValidateIf(o => o.role === UserRole.ASSOCIATION)
  @IsOptional()
  @IsString()
  nameAsso?: string;

  // Champs spécifiques aux entreprises
  @ValidateIf(o => o.role === UserRole.COMPANY)
  @IsOptional()
  @IsString()
  nameCompany?: string;

  // Numéro de contact pour entreprises et associations
  @ValidateIf(o => o.role === UserRole.COMPANY || o.role === UserRole.ASSOCIATION)
  @IsOptional()
  @IsNumber()
  contactPhone?: number;
}