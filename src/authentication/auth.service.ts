import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login-user.dto';
import { compare } from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}
  async login(loginDto: LoginDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [
          {
            email: loginDto.username,
          },
          {
            password: loginDto.password,
          },
        ],
      },
    });
    if (!user) {
      throw new NotFoundException('Unable to find the user');
    }
    // if (!(await compare(loginDto.password, user.password))) {
    //   throw new UnauthorizedException('Invalid credentials!');
    // }

    const token = await this.jwtService.signAsync(user);
    return {
      token,
    };
  }
  async register(registerDto: RegisterUserDto) {
    const userService = new UserService(this.prismaService);
    const user = await userService.create(registerDto);
    const token = await this.jwtService.signAsync(user);
    return {
      token,
    };
  }
}
