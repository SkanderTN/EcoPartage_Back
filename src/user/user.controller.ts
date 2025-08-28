import { Body, Controller, Get, Post, Put, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { GetUser } from "src/auth/decorators/get-user.decorator";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtPayload } from "src/types/jwt-payload.interface";

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    return this.userService.register(dto);
  }

   /**
   * Récupérer tous les utilisateurs (Admin uniquement)
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAllUsers() {
    return this.userService.findAll();
  }
  
  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@GetUser() user: JwtPayload) {
    return this.userService.getProfile(user.userId);
  }

  /**
   * Mettre à jour le profil
   */
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@GetUser() user: JwtPayload, @Body() updateDto: UpdateProfileDto) {
    return this.userService.updateProfile(user.userId, updateDto);
  }

  /**
   * Changer le mot de passe
   */
  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(@GetUser() user: JwtPayload, @Body() changePasswordDto: ChangePasswordDto) {
    await this.userService.changePassword(user.userId, changePasswordDto);
    return { message: 'Mot de passe modifié avec succès' };
  }

  /**
   * Upload photo de profil
   */
  @UseGuards(JwtAuthGuard)
  @Post('profile/picture')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Seuls les fichiers image sont autorisés!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max
    }
  }))
  async uploadProfilePicture(@GetUser() user: JwtPayload, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }
    return this.userService.updateProfilePicture(user.userId, file);
  }
}
