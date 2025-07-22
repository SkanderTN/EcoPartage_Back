import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Association } from './association.entity';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AssociationService {
  constructor(
    @InjectRepository(Association)
    private readonly associationRepo: Repository<Association>,
  ) {}

  async create(dto: CreateAssociationDto, file?: Express.Multer.File): Promise<Association> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
const association = this.associationRepo.create({
  ...dto,
  password: hashedPassword,
  profilePicture: file?.filename ?? null,
});
    return await this.associationRepo.save(association);
  }

  findAll(): Promise<Association[]> {
    return this.associationRepo.find();
  }

  async findOne(id: number): Promise<Association> {
    const association = await this.associationRepo.findOne({ where: { id } });
  if (!association) {
    throw new NotFoundException(`Association with ID ${id} not found`);
  }
  return association;
}

  async update(id: number, dto: UpdateAssociationDto): Promise<Association> {
    await this.associationRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.associationRepo.delete(id);
  }
}
