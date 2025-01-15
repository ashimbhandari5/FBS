import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { profile } from 'console';

@Injectable()
export class ProfileService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createProfileDto: CreateProfileDto) {
    const { userId } = createProfileDto;
    const profile = await this.prismaService.profile.create({
      data: { userId },
    });
    return profile;
  }

  findAll() {
    return this.prismaService.profile.findMany();
  }

  async findOne(id: number) {
    const profile = await this.prismaService.profile.findUnique({
      where: { id },
    });
    if (!profile) {
      throw new NotFoundException(`Profile #${id} not found`);
    }
    return profile;
  }

  async update(id: number, updateData: Partial<CreateProfileDto>) {
    const profile = await this.prismaService.profile.update({
      where: { id },
      data: updateData,
    });
    if (!profile) {
      throw new NotFoundException(`Profile #${id} not found`);
    }
    return profile;
  }

  remove(id: number) {
    try {
      return this.prismaService.profile.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`profile with ID ${id} not found`);
    }
  }
}
