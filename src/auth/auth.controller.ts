import { Controller, Post, Body, UseGuards, Get, Request, UseInterceptors, UploadedFile, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateAssociationDto } from '../association/dto/create-association.dto';
import { CreateCompanyDto } from '../company/dto/create-company.dto';
import { CreateSimpleUserDto } from '../simpleUser/dto/create-simple-user.dto';
import { diskStorage } from 'multer'; 
import { extname } from 'path';     

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/association')
  @UseInterceptors(FileInterceptor('profilePicture', { 
      storage: diskStorage({ 
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extname(file.originalname)}`;
          console.log(`[Multer AuthController] Saving file for Association: ${uniqueName}`);
          callback(null, uniqueName);
        },
      }),
    }),)
async registerAssociation(
  @Body() body: { dto: string },
  @UploadedFile() file: Express.Multer.File,
) {
  const dto: CreateAssociationDto = JSON.parse(body.dto); 
    return this.authService.registerAssociation(dto, file);
}

@Post('register/company')
@UseInterceptors(FileInterceptor('profilePicture', { 
      storage: diskStorage({ 
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extname(file.originalname)}`;
          console.log(`[Multer AuthController] Saving file for Company: ${uniqueName}`);
          callback(null, uniqueName);
        },
      }),
    }))
async registerCompany(@Body() body: { dto: string },
@UploadedFile() file: Express.Multer.File,) {
  const dto: CreateCompanyDto = JSON.parse(body.dto); 
    return this.authService.registerCompany(dto, file);
}

@Post('register/simple-user')
@UseInterceptors(FileInterceptor('profilePicture', { 
      storage: diskStorage({ 
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extname(file.originalname)}`;
          console.log(`[Multer AuthController] Saving file for SimpleUser: ${uniqueName}`);
          callback(null, uniqueName);
        },
      }),
    }))
async registerSimple(@Body() body: { dto: string },
@UploadedFile() file: Express.Multer.File,) {
  const dto: CreateSimpleUserDto = JSON.parse(body.dto); 
    return this.authService.registerSimpleUser(dto, file);
}


  @Post('login')
  async login(@Body() data: { email: string; password: string }) {
    return this.authService.login(data.email, data.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('protected')
  getProtected(@Request() req: any) {
    return {
      message: 'Protected route',
      user: req.user,
    };
  }
}
