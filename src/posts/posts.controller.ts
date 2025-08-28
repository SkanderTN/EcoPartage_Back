import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards, 
  Request, 
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostDto } from './dto/filter-post.dto';
import { EstimatePriceDto } from './dto/estimate-price.dto';
import { SuggestFieldDto } from './dto/suggest-field.dto';
import { AiPriceEstimationService } from './services/ai-price-estimation.service';
import { CategoryService } from './services/category.service';
import { AuthGuard } from '@nestjs/passport';
import { PostResponseDto, PostsResponseDto } from './dto/post-response.dto'; 
import { Post as PostEntity } from './entities/post.entity'; 



@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly aiPriceEstimationService: AiPriceEstimationService,
    private readonly categoryService: CategoryService,
  ) {}

  @Post()
    @UseGuards(AuthGuard('jwt')) 
  create(@Body() createPostDto: CreatePostDto, @Request() req: any): Promise<PostEntity> {
       const userId = req.user.userId;
    return this.postsService.create(createPostDto, userId);
  }

  @Get()
  findAll(@Query() filterDto: FilterPostDto): Promise<PostsResponseDto> {
    return this.postsService.findAll(filterDto);
  }

  // Category endpoints - must come before :id route
  @Get('categories')
  getCategories() {
    return this.categoryService.findAll();
  }

  @Post('categories')
  createCategory(@Body() body: { name: string; description?: string }) {
    return this.categoryService.create(body.name, body.description);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PostResponseDto> {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }

  @Post('estimate-price')
  async estimatePrice(@Body() estimatePriceDto: EstimatePriceDto) {
    try {
      console.log('Received price estimation request:', {
        title: estimatePriceDto.title,
        condition: estimatePriceDto.condition,
        hasMainPhoto: !!estimatePriceDto.mainPhotoBase64,
        mainPhotoSize: estimatePriceDto.mainPhotoBase64?.length || 0
      });
      
      const estimatedPrice = await this.aiPriceEstimationService.estimatePrice(estimatePriceDto);
      return { estimatedPrice };
    } catch (error) {
      console.error('Error in price estimation endpoint:', error);
      throw error;
    }
  }

  @Post('suggest-field')
  async suggestField(@Body() suggestFieldDto: SuggestFieldDto) {
    try {
      console.log('Received field suggestion request:', {
        fieldType: suggestFieldDto.fieldType,
        hasMainPhoto: !!suggestFieldDto.mainPhotoBase64,
        mainPhotoSize: suggestFieldDto.mainPhotoBase64?.length || 0,
        existingTitle: suggestFieldDto.existingTitle,
        condition: suggestFieldDto.condition
      });
      
      const suggestion = await this.aiPriceEstimationService.suggestField(suggestFieldDto);
      return { suggestion };
    } catch (error) {
      console.error('Error in field suggestion endpoint:', error);
      throw error;
    }
  }
}
