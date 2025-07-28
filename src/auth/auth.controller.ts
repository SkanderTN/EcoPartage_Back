import { Controller, Post, Body, UseGuards, Get, Request, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterUserDto } from '../user/dto/register-user.dto';
import { memoryStorage } from 'multer'; 
import { Roles } from './decorators/roles.decorator'; 
import { RolesGuard } from './guards/roles.guard';       

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register') 
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // Limite la taille du fichier à 10 Mo (en octets)
      },
      fileFilter: (req, file, cb) => {
        // Validation optionnelle du type de fichier (non requis pour votre erreur actuelle, mais bonne pratique)
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new HttpException('Seuls les fichiers image sont autorisés (jpg, jpeg, png, gif)!', HttpStatus.BAD_REQUEST), false);
        }
        cb(null, true);
      },
    }),
  )
  async register( 
    @Body() body: { dto: string }, 
    @UploadedFile() file: Express.Multer.File,
  ) {
    const dto: RegisterUserDto = JSON.parse(body.dto); 
    return this.authService.register(dto, file); 
  }

  @Post('login')
  async login(@Body() data: { email: string; password: string }) {
    return this.authService.login(data.email, data.password);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('simple', 'company', 'association')
  @Get('protected')
  getProtected(@Request() req: any) {
    return {
      message: 'Protected route',
      user: req.user,
    };
  }
}
