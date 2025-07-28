import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsNumber, ValidateIf, IsNotEmpty } from 'class-validator';

export enum UserRole {
  SIMPLE = 'simple',
  COMPANY = 'company',
  ASSOCIATION = 'association',
}

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères.' })
  password: string;

  @IsOptional()
  @IsString()
  profilePicture?: string; 

  @IsEnum(UserRole, { message: 'Le rôle doit être simple, company ou association' })
  @IsNotEmpty()
  role: UserRole;

  @ValidateIf(o => o.role === UserRole.ASSOCIATION) 
  @IsNotEmpty({ message: 'Le nom de l\'association est requis pour le rôle "association".' })
  @IsString()
  nameAsso?: string; 

  @ValidateIf(o => o.role === UserRole.COMPANY || o.role === UserRole.ASSOCIATION) 
  @IsNotEmpty({ message: 'Le numéro de contact est requis pour les rôles "company" et "association".' })
  @IsNumber({}, { message: 'Le numéro de contact doit être un nombre.' }) 
  contactPhone?: number;

  @ValidateIf(o => o.role === UserRole.COMPANY) 
  @IsNotEmpty({ message: 'Le nom de l\'entreprise est requis pour le rôle "company".' })
  @IsString()
  nameCompany?: string; 
}
