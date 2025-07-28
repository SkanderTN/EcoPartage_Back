import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { jwtConstants } from './constants'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { SimpleUser } from '../user/entities/simple-user.entity';
import { Company } from '../user/entities/company.entity';
import { Association } from '../user/entities/association.entity';
import { RolesGuard } from './guards/roles.guard'; 
import { UserService } from '../user/user.service'; 
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; // <-- IMPORT THIS


@Module({
  imports: [
    TypeOrmModule.forFeature([User, SimpleUser, Company, Association]),  
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret, 
      signOptions: { expiresIn: '60m' }, 
    }),
    CloudinaryModule,
  ],
  providers: [AuthService, JwtStrategy, UserService, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
