import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';


@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async create(dto: CreateCompanyDto, file?: Express.Multer.File): Promise<Company> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const company = this.companyRepo.create({
  ...dto,
  password: hashedPassword,
  profilePicture: file?.filename ?? null,
});
    return this.companyRepo.save(company);
  }

  findAll(): Promise<Company[]> {
    return this.companyRepo.find();
  }

  async findOne(id: number): Promise<Company> {
      const company = await this.companyRepo.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  async update(id: number, dto: UpdateCompanyDto): Promise<Company> {
    await this.companyRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.companyRepo.delete(id);
  }
}
