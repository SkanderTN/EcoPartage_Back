import { Exclude, Transform } from 'class-transformer';
import { UserRole } from './register-user.dto';

export class ProfileResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  profilePicture: string | null;
  isActive: boolean;
  nameAsso?: string;
  nameCompany?: string;
  contactPhone?: number;
}