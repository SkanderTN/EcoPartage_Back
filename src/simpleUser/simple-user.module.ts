import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimpleUser } from './simple-user.entity';
import { SimpleUserService } from './simple-user.service';
import { SimpleUserController } from './simple-user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SimpleUser])],
  controllers: [SimpleUserController],
  providers: [SimpleUserService],
  exports: [SimpleUserService],
})
export class SimpleUserModule {}
