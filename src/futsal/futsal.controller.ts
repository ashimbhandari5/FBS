import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FutsalService } from './futsal.service';
import { CreateFutsalDto } from './dto/create-futsal.dto';
import { UpdateFutsalDto } from './dto/update-futsal.dto';

@Controller('futsal')
export class FutsalController {
  constructor(private readonly futsalService: FutsalService) {}

  @Post()
  create(@Body() createFutsalDto: CreateFutsalDto) {
    return this.futsalService.create(createFutsalDto);
  }

  @Get()
  findAll() {
    return this.futsalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.futsalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFutsalDto: UpdateFutsalDto) {
    return this.futsalService.update(+id, updateFutsalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.futsalService.remove(+id);
  }
}
