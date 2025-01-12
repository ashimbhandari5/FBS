import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFutsalDto } from './dto/create-futsal.dto';
import { UpdateFutsalDto } from './dto/update-futsal.dto';

@Injectable()
export class FutsalService {
  constructor(private prismaService: PrismaService) {}

  async create(createFutsalDto: CreateFutsalDto) {
    return this.prismaService.futsal.create({
      data: {
        ...createFutsalDto,
        ownerId: createFutsalDto.ownerId,
      },
    });
  }

  async findAll() {
    return this.prismaService.futsal.findMany({
      include: {
        booking: true,
      },
    });
  }

  async findOne(id: number) {
    const futsal = await this.prismaService.futsal.findUnique({
      where: { id },
      include: {
        booking: true,
      },
    });
    if (!futsal) {
      throw new NotFoundException(`Futsal with ID ${id} not found`);
    }
    return futsal;
  }

  async update(id: number, updateFutsalDto: UpdateFutsalDto) {
    await this.checkIfFutsalExist(id);
    return this.prismaService.futsal.update({
      where: { id },
      data: {
        ...updateFutsalDto,
        ownerId: updateFutsalDto.ownerId,
      },
    });
  }

  async remove(id: number) {
    await this.checkIfFutsalExist(id);
    return this.prismaService.futsal.delete({
      where: { id },
    });
  }

  async getFutsalById(id: number) {
    const futsal = await this.prismaService.futsal.findUnique({
      where: { id },
      include: {
        booking: true,
      },
    });
    if (!futsal) {
      throw new NotFoundException(`Futsal with ID ${id} not found`);
    }
    return futsal;
  }

  async checkIfFutsalExist(id: number) {
    const futsal = await this.prismaService.futsal.findUnique({
      where: { id },
    });
    if (!futsal) {
      throw new NotFoundException(`Futsal with ID ${id} not found`);
    }
  }
}
