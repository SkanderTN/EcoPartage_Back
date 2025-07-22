import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { SimpleUserService } from './simple-user.service';
import { CreateSimpleUserDto } from './dto/create-simple-user.dto';
import { UpdateSimpleUserDto } from './dto/update-simple-user.dto';

@Controller('simple-user')
export class SimpleUserController {
  constructor(private readonly simpleUserService: SimpleUserService) {}

  @Post()
  async create(
    @Body() dto: CreateSimpleUserDto,
  ) {
    return this.simpleUserService.create(dto);
  }

  @Get()
  findAll() {
    return this.simpleUserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.simpleUserService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSimpleUserDto) {
    return this.simpleUserService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.simpleUserService.remove(id);
  }
}
