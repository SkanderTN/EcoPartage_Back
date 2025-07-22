import { Module } from '@nestjs/common';
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
    AssociationModule,
    CompanyModule,
    //SimpleUserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
