import { Injectable } from '@nestjs/common';
import { CreateFutsalDto } from './dto/create-futsal.dto';
import { UpdateFutsalDto } from './dto/update-futsal.dto';

@Injectable()
export class FutsalService {
  create(createFutsalDto: CreateFutsalDto) {
    return 'This action adds a new futsal';
  }

  findAll() {
    return `This action returns all futsal`;
  }

  findOne(id: number) {
    return `This action returns a #${id} futsal`;
  }

  update(id: number, updateFutsalDto: UpdateFutsalDto) {
    return `This action updates a #${id} futsal`;
  }

  remove(id: number) {
    return `This action removes a #${id} futsal`;
  }
}
