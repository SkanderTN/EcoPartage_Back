import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity'; 
import { SimpleUser } from './entities/simple-user.entity'; 
import { Company } from './entities/company.entity';       
import { Association } from './entities/association.entity'; 
import { RegisterUserDto, UserRole } from './dto/register-user.dto'; 

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(SimpleUser)
    private readonly simpleUserRepo: Repository<SimpleUser>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(Association)
    private readonly associationRepo: Repository<Association>,
  ) {}

  async register(dto: RegisterUserDto, imageUrl?: string | null): Promise<User> {
    const { role, password, ...rest } = dto;

    if (!role) {
      throw new BadRequestException('Le champ "role" est requis (simple, company, association)');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let userToCreate: User;

    switch (role) {
      case UserRole.SIMPLE:
        userToCreate = this.simpleUserRepo.create({
          ...rest,
          password: hashedPassword,
          profilePicture: imageUrl,
          role: UserRole.SIMPLE,
        });
        break;

      case UserRole.COMPANY: 
        userToCreate = this.companyRepo.create({
          ...rest,
          password: hashedPassword,
          profilePicture: imageUrl,
          role: UserRole.COMPANY, 
        });
        break;

      case UserRole.ASSOCIATION: 
        userToCreate = this.associationRepo.create({
          ...rest,
          password: hashedPassword,
          profilePicture: imageUrl,
          role: UserRole.ASSOCIATION, 
        });
        break

      default:
        throw new BadRequestException(`Rôle invalide : ${role}`);
    }

        return await this.userRepo.save(userToCreate);
  }


  //à relire et à vérifier
async findAll(): Promise<User[]> {
    return this.userRepo.find(); 
  }

  async findOne(id: number, role?: UserRole): Promise<User | null> { 
    const findOptions: any = { where: { id } };
    if (role) {
      findOptions.where = { ...findOptions.where, role };
    }
    const user = await this.userRepo.findOne(findOptions);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} and role ${role || 'any'} not found`);
    }
    return user;
  }

  async update(id: number, role: UserRole, updateDto: Partial<RegisterUserDto>): Promise<User> { 
    const user = await this.findOne(id, role);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} and role ${role} not found`);
    }

    Object.assign(user, updateDto);

    if (updateDto.password) {
      user.password = await bcrypt.hash(updateDto.password, 10);
    }

    return this.userRepo.save(user);
  }

  async remove(id: number, role?: UserRole): Promise<void> { 
    const result = await this.userRepo.delete({ id, role });
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} and role ${role || 'any'} not found`);
    }
  }
}
