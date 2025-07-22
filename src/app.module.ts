import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity/user.entity';
import { AuthModule } from './auth/auth.module';
import { AssociationModule } from './association/association.module';
import { CompanyModule } from './company/company.module';
import { Association } from './association/association.entity';
import { Company } from './company/company.entity';
import { SimpleUser } from './simpleUser/simple-user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5455', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'eco_partage',
      entities: [User, Association, Company, SimpleUser],
      synchronize: true, 
    }),
    UserModule,
    AuthModule,
    AssociationModule,
    CompanyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
