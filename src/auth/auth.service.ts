import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity/user.entity';
import { CreateAssociationDto } from '../association/dto/create-association.dto';
import { CreateCompanyDto } from '../company/dto/create-company.dto';
import { CreateSimpleUserDto } from '../simpleUser/dto/create-simple-user.dto';
import { AssociationService } from '../association/association.service';
import { CompanyService } from '../company/company.service';
import { SimpleUserService } from '../simpleUser/simple-user.service';




@Injectable()
export class AuthService {
    
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly associationService: AssociationService,
  private readonly companyService: CompanyService,
  private readonly simpleUserService: SimpleUserService,
  ) {}

  async registerAssociation(
    dto: CreateAssociationDto,
    file: Express.Multer.File, 
  ) {
    return this.associationService.create(dto, file);
  }

async registerCompany(
  dto: CreateCompanyDto,
  file?: Express.Multer.File,) {
  return this.companyService.create(dto, file);
}

async registerSimpleUser(dto: CreateSimpleUserDto,
  file?: Express.Multer.File) {
  return this.simpleUserService.create(dto, file);
}

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Email not found');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid password');

    const payload = { sub: user.id, email: user.email};
    const token = this.jwtService.sign(payload);
    return { access_token: token };
  }
}
