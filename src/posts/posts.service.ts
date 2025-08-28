import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostDto } from './dto/filter-post.dto';
import { User } from '../user/entities/user.entity'; 
import { PostResponseDto, PostsResponseDto } from './dto/post-response.dto';

@Injectable()
export class PostsService {
 private readonly logger = new Logger(PostsService.name);

 constructor(
  @InjectRepository(Post)
  private readonly postRepository: Repository<Post>,
  @InjectRepository(User) 
  private readonly userRepository: Repository<User>,
 ) {}

 // CREATE
 async create(createPostDto: CreatePostDto, userId: number): Promise<Post> {
  const post = this.postRepository.create({
   ...createPostDto,
   userId: userId,
  });
  return this.postRepository.save(post);
 }

 // FIND ALL + FILTERS
 async findAll(
  filterDto: FilterPostDto,
 ): Promise<PostsResponseDto> {
  const qb = this.postRepository.createQueryBuilder('post')
  .leftJoinAndSelect('post.user', 'user')
  .leftJoinAndSelect('post.category', 'category');

  if (filterDto.city) {
   qb.andWhere('LOWER(post.city) = LOWER(:city)', { city: filterDto.city });
  }
  if (filterDto.type) {
   qb.andWhere('post.type = :type', { type: filterDto.type });
  }
  if (filterDto.condition) {
   qb.andWhere('post.condition = :condition', {
    condition: filterDto.condition,
   });
  }
  if (filterDto.status) {
   qb.andWhere('post.status = :status', { status: filterDto.status });
  }
  if (filterDto.minPrice !== undefined) {
   qb.andWhere('post.price >= :minPrice', { minPrice: filterDto.minPrice });
  }
  if (filterDto.maxPrice !== undefined) {
   qb.andWhere('post.price <= :maxPrice', { maxPrice: filterDto.maxPrice });
  }
  if (filterDto.categoryId) {
      qb.andWhere('post.categoryId = :categoryId', { categoryId: filterDto.categoryId });
    }
  if (filterDto.q) {
   qb.andWhere(
    '(LOWER(post.title) LIKE LOWER(:q) OR LOWER(post.description) LIKE LOWER(:q))',
    { q: `%${filterDto.q}%` },
   );
  }

  qb.orderBy('post.createdAt', 'DESC');

  // Pagination logic
  const page = filterDto.page || 1;
  const limit = filterDto.limit || 10;
  qb.skip((page - 1) * limit).take(limit);

  const [rawPosts, total] = await qb.getManyAndCount();

  // Mapper les posts pour inclure le userName (prénom + nom) de l'utilisateur
  const data: PostResponseDto[] = rawPosts.map(post => {
   const userName = post.user ? `${post.user.firstName || ''} ${post.user.lastName || ''}`.trim() : undefined;
   return {
    ...post,
    userName: userName || undefined,
   };
  });

  return {
   data,
   total,
   page,
   limit,
  };
 }

 // FIND ONE
 async findOne(id: string): Promise<PostResponseDto> {
  const post = await this.postRepository.findOne({ where: { id }, relations: ['user', 'category'] });
  if (!post) throw new NotFoundException('Post not found');

  const userName = post.user ? `${post.user.firstName || ''} ${post.user.lastName || ''}`.trim() : undefined;

  const postWithUserName: PostResponseDto = {
   ...post,
   userName: userName || undefined,
  }; 
  return postWithUserName; 
 }

 // UPDATE
 async update(id: string, updatePostDto: UpdatePostDto): Promise<PostResponseDto> {
  // Récupérer l'entité Post réelle de la base de données
  const postToUpdate = await this.postRepository.findOne({ where: { id } });
  if (!postToUpdate) {
   throw new NotFoundException(`Post with ID ${id} not found for update`);
  }

  // Appliquer les mises à jour au niveau de l'entité
  Object.assign(postToUpdate, updatePostDto);
  
  // Sauvegarder l'entité mise à jour
  const updatedPost = await this.postRepository.save(postToUpdate);

  // Retourner le DTO de réponse avec le userName
  // Nous devons refaire le findOne pour s'assurer que la relation 'user' est chargée
  // et que le userName est correctement généré pour la réponse.
  return this.findOne(updatedPost.id);
 }

 // DELETE
 async remove(id: string): Promise<void> {
  const result = await this.postRepository.delete(id);
  if (result.affected === 0) throw new NotFoundException('Post not found');
 }
}