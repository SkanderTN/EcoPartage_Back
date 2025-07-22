import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { AssociationService } from './association.service';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';

@Controller('associations')
export class AssociationController {
  constructor(private readonly associationService: AssociationService) {}

  @Post()
  async create(
    @Body() dto: CreateAssociationDto,
  ) {
    return this.associationService.create(dto);
  }

  @Get()
  findAll() {
    return this.associationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.associationService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAssociationDto) {
    return this.associationService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.associationService.remove(id);
  }
}
