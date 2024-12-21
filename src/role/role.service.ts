import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { capitalizeFirstLetterOfEachWordInAPhrase } from 'src/helpers/capitalize';

@Injectable()
export class RoleService {
  constructor(private prismaService: PrismaService) {}

  // Create a new role
  async create(createRoleDto: CreateRoleDto) {
    createRoleDto.name = capitalizeFirstLetterOfEachWordInAPhrase(
      createRoleDto.name,
    );

    if (await this.checkIfRoleExist(createRoleDto.name)) {
      throw new BadRequestException(
        `Role ${createRoleDto.name} has already been taken`,
      );
    }

    return this.prismaService.role.create({ data: createRoleDto });
  }

  // Find all roles
  findAll() {
    return this.prismaService.role.findMany();
  }

  // Find a single role by ID
  async findOne(id: number) {
    return this.getRoleById(id);
  }

  // Update an existing role
  async update(id: number, updateRoleDto: UpdateRoleDto) {
    await this.getRoleById(id);

    updateRoleDto.name = capitalizeFirstLetterOfEachWordInAPhrase(
      updateRoleDto.name,
    );

    if (await this.checkIfRoleExist(updateRoleDto.name, id)) {
      throw new BadRequestException(
        `Role ${updateRoleDto.name} has already been taken`,
      );
    }

    return this.prismaService.role.update({
      where: { id },
      data: updateRoleDto,
    });
  }

  // Delete a role
  async remove(id: number) {
    await this.getRoleById(id);
    return this.prismaService.role.deleteMany({ where: { id } });
  }

  // Private method: Get role by ID
  private async getRoleById(id: number) {
    const role = await this.prismaService.role.findFirst({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} does not exist`);
    }
    return role;
  }

  private async checkIfRoleExist(name: string, id?: number): Promise<boolean> {
    const role = await this.prismaService.role.findUnique({
      where: { name },
    });

    if (id) {
      return role ? role.id === id : true;
    }

    return !!role;
  }
}
