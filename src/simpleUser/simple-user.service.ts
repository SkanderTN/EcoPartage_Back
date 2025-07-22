import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SimpleUser } from './simple-user.entity';
import { CreateSimpleUserDto } from './dto/create-simple-user.dto';
import { UpdateSimpleUserDto } from './dto/update-simple-user.dto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class SimpleUserService {
  constructor(
    @InjectRepository(SimpleUser)
    private readonly simpleUserRepo: Repository<SimpleUser>,
  ) {}

  async create(dto: CreateSimpleUserDto, file?: Express.Multer.File): Promise<SimpleUser> {
  const hashedPassword = await bcrypt.hash(dto.password, 10); // hachage ici

  const user = this.simpleUserRepo.create({
    ...dto,
    password: hashedPassword, // on stocke le mot de passe haché
    profilePicture: file?.filename ?? null,
  });

  return this.simpleUserRepo.save(user);
}

  findAll(): Promise<SimpleUser[]> {
    return this.simpleUserRepo.find();
  }

  async findOne(id: number): Promise<SimpleUser> {
    const user = await this.simpleUserRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async update(id: number, dto: UpdateSimpleUserDto): Promise<SimpleUser> {
    await this.simpleUserRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.simpleUserRepo.delete(id);
  }
}
