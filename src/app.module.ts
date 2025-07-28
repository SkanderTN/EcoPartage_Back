import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { Association } from './user/entities/association.entity'; 
import { Company } from './user/entities/company.entity';       
import { SimpleUser } from './user/entities/simple-user.entity'; 
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ConfigModule } from '@nestjs/config'; // Ajoutez cet import


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Rend les variables d'environnement disponibles globalement
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres', //à vérifier
      password: 'Roua1234',
      database: 'mydb',
      entities: [User, Association, Company, SimpleUser],
      synchronize: true, // ⚠️ à désactiver en production
    }),
    UserModule,
    AuthModule,
    CloudinaryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
