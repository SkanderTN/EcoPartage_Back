import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity'; 
import { SimpleUser } from './entities/simple-user.entity'; 
import { Company } from './entities/company.entity';       
import { Association } from './entities/association.entity'; 
import { RegisterUserDto, UserRole } from './dto/register-user.dto'; 
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(SimpleUser)
    private readonly simpleUserRepo: Repository<SimpleUser>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(Association)
    private readonly associationRepo: Repository<Association>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async register(dto: RegisterUserDto, imageUrl?: string | null): Promise<User> {
    const { role, password, ...rest } = dto;

    if (!role) {
      throw new BadRequestException('Le champ "role" est requis (simple, company, association)');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let userToCreate: User;

    switch (role) {
      case UserRole.SIMPLE:
        userToCreate = this.simpleUserRepo.create({
          ...rest,
          password: hashedPassword,
          profilePicture: imageUrl,
          role: UserRole.SIMPLE,
        });
        break;

      case UserRole.COMPANY: 
        userToCreate = this.companyRepo.create({
          ...rest,
          password: hashedPassword,
          profilePicture: imageUrl,
          role: UserRole.COMPANY, 
        });
        break;

      case UserRole.ASSOCIATION: 
        userToCreate = this.associationRepo.create({
          ...rest,
          password: hashedPassword,
          profilePicture: imageUrl,
          role: UserRole.ASSOCIATION, 
        });
        break;

      default:
        throw new BadRequestException(`Rôle invalide : ${role}`);
    }

        return await this.userRepo.save(userToCreate);
  }

/**
   * Récupérer le profil complet de l'utilisateur
   */
  async getProfile(userId: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['posts'], // Inclure les posts si nécessaire
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Retourner sans le mot de passe
    const { password, ...userProfile } = user;
    return userProfile as User;
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateProfile(userId: number, updateDto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (updateDto.email && updateDto.email !== user.email) {
      const existingUser = await this.userRepo.findOne({
        where: { email: updateDto.email }
      });
      if (existingUser) {
        throw new BadRequestException('Cet email est déjà utilisé');
      }
    }

    // Mettre à jour les champs selon le rôle
    Object.assign(user, updateDto);

    const updatedUser = await this.userRepo.save(user);
    
    // Retourner sans le mot de passe
    const { password, ...userProfile } = updatedUser;
    return userProfile as User;
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepo.findOne({ 
      where: { id: userId },
      select: ['id', 'password'] // Récupérer explicitement le password pour la comparaison
    });
    
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier l'ancien mot de passe
    const isValidPassword = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    // Hasher et sauvegarder le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.userRepo.update(userId, { password: hashedNewPassword });
  }

  /**
   * Upload/Update photo de profil avec Cloudinary
   */
  async updateProfilePicture(userId: number, file: Express.Multer.File): Promise<{ profilePicture: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    try {
      // Upload vers Cloudinary
      const imageUrl = await this.cloudinaryService.uploadImage(file, 'profile_pictures');
      
      // Mettre à jour la base de données
      await this.userRepo.update(userId, { profilePicture: imageUrl });
      
      return { profilePicture: imageUrl };
    } catch (error) {
      throw new BadRequestException('Erreur lors de l\'upload de l\'image');
    }
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find(); 
  }

  async findOne(id: number, role?: UserRole): Promise<User | null> { 
    const findOptions: any = { where: { id } };
    if (role) {
      findOptions.where = { ...findOptions.where, role };
    }
    const user = await this.userRepo.findOne(findOptions);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} and role ${role || 'any'} not found`);
    }
    return user;
  }

  async update(id: number, role: UserRole, updateDto: Partial<RegisterUserDto>): Promise<User> { 
    const user = await this.findOne(id, role);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} and role ${role} not found`);
    }

    Object.assign(user, updateDto);

    if (updateDto.password) {
      user.password = await bcrypt.hash(updateDto.password, 10);
    }

    return this.userRepo.save(user);
  }

  async remove(id: number, role?: UserRole): Promise<void> { 
    const result = await this.userRepo.delete({ id, role });
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} and role ${role || 'any'} not found`);
    }
  }
}
