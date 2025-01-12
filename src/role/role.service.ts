import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(private prismaService: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    return this.prismaService.role.create({
      data: createRoleDto,
    });
  }

  async findAll() {
    return this.prismaService.role.findMany({
      include: {
        user: true,
      },
    });
  }

  async findOne(id: number) {
    const role = await this.prismaService.role.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    await this.checkIfRoleExist(id);
    return this.prismaService.role.update({
      where: { id },
      data: updateRoleDto,
    });
  }

  async remove(id: number) {
    await this.checkIfRoleExist(id);
    return this.prismaService.role.delete({
      where: { id },
    });
  }

  private async getRoleById(id: number) {
    const role = await this.prismaService.role.findFirst({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} does not exist`);
    }
    return role;
  }

  private async checkIfRoleExist(id: number): Promise<boolean> {
    const role = await this.prismaService.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} does not exist`);
    }
    return true;
  }
}
