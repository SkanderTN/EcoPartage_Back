import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostDto } from './dto/filter-post.dto';


@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  // CREATE
  async create(createPostDto: CreatePostDto): Promise<Post> {
    const post = this.postRepository.create(createPostDto);
    return this.postRepository.save(post);
  }
  
  // FIND ALL + FILTERS
  async findAll(filterDto: FilterPostDto): Promise<{ data: Post[]; total: number; page: number; limit: number }> {
    const qb = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category');

    if (filterDto.city) {
      qb.andWhere('LOWER(post.city) = LOWER(:city)', { city: filterDto.city });
    }
    if (filterDto.type) {
      qb.andWhere('post.type = :type', { type: filterDto.type });
    }
    if (filterDto.condition) {
      qb.andWhere('post.condition = :condition', { condition: filterDto.condition });
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

     const [data, total] = await qb.getManyAndCount();

     return {
       data,
       total,
       page,
       limit,
     };
  }

  // FIND ONE
  async findOne(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({ 
      where: { id },
      relations: ['category']
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  // UPDATE
  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    Object.assign(post, updatePostDto);
    return this.postRepository.save(post);
  }

  // DELETE
  async remove(id: string): Promise<void> {
    const result = await this.postRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Post not found');
  }
}
