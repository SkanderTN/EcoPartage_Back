import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { RegisterUserDto } from '../user/dto/register-user.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async register(
    dto: RegisterUserDto,
    file?: Express.Multer.File,
  ): Promise<User> {
    let imageUrl: string | null = null;
    if (file) {
      // Uploadez l'image sur Cloudinary et récupérez l'URL
      imageUrl = await this.cloudinaryService.uploadImage(
        file,
        'profile_pictures',
      ); // Spécifiez un dossier Cloudinary
    }
    // Passez l'URL de l'image au UserService
    return this.userService.register(dto, imageUrl); // <-- Passez l'URL au lieu du fichier brut
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Email not found');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid password');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);
    return {
      access_token: token,
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }
}
