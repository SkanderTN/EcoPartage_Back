import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { jwtConstants } from './constants'; // Your JWT secret and expiration
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity/user.entity';
import { AssociationModule } from '../association/association.module';
import { CompanyModule } from '../company/company.module';
import { SimpleUserModule } from '../simpleUser/simple-user.module';



@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UserModule,
    AssociationModule, 
    CompanyModule,     
    SimpleUserModule,  
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret, // Your JWT secret
      signOptions: { expiresIn: '60m' }, // Token expiration
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
