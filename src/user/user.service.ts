import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { capitalizeFirstLetterOfEachWordInAPhrase } from 'src/helpers/capitalize';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  // Create a new user
  async create(createUserDto: CreateUserDto) {
    createUserDto.name = capitalizeFirstLetterOfEachWordInAPhrase(
      createUserDto.name,
    );

    if (await this.checkIfUserExist(createUserDto.name)) {
      throw new BadRequestException(
        `User ${createUserDto.name} has already been taken`,
      );
    }

    // Create user with default 100 points
    return this.prismaService.user.create({
      data: {
        ...createUserDto,
        points: 100, // Initial points allocation
      },
    });
  }

  // Find all roles
  findAll() {
    return this.prismaService.user.findMany();
  }

  // Find a single user by ID
  async findOne(id: number) {
    return this.getUserById(id);
  }

  // Update an existing user
  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.getUserById(id);

    updateUserDto.name = capitalizeFirstLetterOfEachWordInAPhrase(
      updateUserDto.name,
    );

    if (await this.checkIfUserExist(updateUserDto.name, id)) {
      throw new BadRequestException(
        `User ${updateUserDto.name} has already been taken`,
      );
    }

    return this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  // Delete a user
  async remove(id: number) {
    await this.getUserById(id);
    return this.prismaService.user.deleteMany({ where: { id } });
  }

  // Private method: Get user by ID
  private async getUserById(id: number) {
    const user = await this.prismaService.user.findFirst({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} does not exist`);
    }
    return user;
  }

  private async checkIfUserExist(name: string, id?: number): Promise<boolean> {
    const user = await this.prismaService.user.findFirst({
      where: { name: name },
    });

    if (id) {
      return user ? user.id !== id : false;
    }

    return !!user;
  }
}
