import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFutsalDto } from './dto/create-futsal.dto';
import { UpdateFutsalDto } from './dto/update-futsal.dto';

@Injectable()
export class FutsalService {
  constructor(private prisma: PrismaService) {}

  async create(createFutsalDto: CreateFutsalDto) {
    return this.prisma.futsal.create({
      data: createFutsalDto,
    });
  }

  async findAll() {
    return this.prisma.futsal.findMany();
  }

  async findOne(id: number) {
    return this.prisma.futsal.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateFutsalDto: UpdateFutsalDto) {
    await this.checkIfFutsalExist(id);
    return this.prisma.futsal.update({
      where: { id },
      data: updateFutsalDto,
    });
  }

  async remove(id: number) {
    await this.checkIfFutsalExist(id);
    return this.prisma.futsal.delete({
      where: { id },
    });
  }

  async getFutsalById(id: number) {
    const futsal = await this.prisma.futsal.findUnique({
      where: { id },
    });
    if (!futsal) {
      throw new NotFoundException(`Futsal with ID ${id} not found`);
    }
    return futsal;
  }

  async checkIfFutsalExist(id: number) {
    const futsal = await this.prisma.futsal.findUnique({
      where: { id },
    });
    if (!futsal) {
      throw new NotFoundException(`Futsal with ID ${id} not found`);
    }
  }
}
