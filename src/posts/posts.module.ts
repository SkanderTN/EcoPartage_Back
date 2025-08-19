import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Category } from './entities/category.entity';
import { AiPriceEstimationService } from './services/ai-price-estimation.service';
import { CategoryService } from './services/category.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Category])],
  providers: [PostsService, AiPriceEstimationService, CategoryService],
  controllers: [PostsController]
})
export class PostsModule {}
