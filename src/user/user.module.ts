import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { SimpleUser } from './entities/simple-user.entity';
import { Company } from './entities/company.entity';
import { Association } from './entities/association.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; // Import du module Cloudinary


@Module({
  imports: [
    TypeOrmModule.forFeature([User, SimpleUser, Company, Association]),
    CloudinaryModule, 
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
