import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(private prismaService: PrismaService) {}

  async create(createBookingDto: CreateBookingDto) {
    return this.prismaService.booking.create({
      data: {
        booking_date: createBookingDto.booking_date,
        start_time: createBookingDto.start_time,
        end_time: createBookingDto.end_time,
        price: createBookingDto.price.toString(),
        status: createBookingDto.status,
        userId: createBookingDto.userId,
        futsal: {
          connect: { id: createBookingDto.futsalId },
        },
      },
    });
  }

  async findAll() {
    return this.prismaService.booking.findMany({
      include: {
        user: true,
        futsal: true,
      },
    });
  }

  async findOne(id: number) {
    const booking = await this.prismaService.booking.findUnique({
      where: { id },
      include: {
        user: true,
        futsal: true,
      },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  async update(id: number, updateBookingDto: UpdateBookingDto) {
    await this.checkIfBookingExist(id);
    return this.prismaService.booking.update({
      where: { id },
      data: {
        booking_date: updateBookingDto.booking_date,
        start_time: updateBookingDto.start_time,
        end_time: updateBookingDto.end_time,
        price: updateBookingDto.price.toString(),
        status: updateBookingDto.status,
        user: updateBookingDto.userId
          ? { connect: { id: updateBookingDto.userId } }
          : undefined,
        futsal: updateBookingDto.futsalId
          ? { connect: { id: updateBookingDto.futsalId } }
          : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.checkIfBookingExist(id);
    return this.prismaService.booking.delete({
      where: { id },
    });
  }

  async getBookingById(id: number) {
    const booking = await this.prismaService.booking.findUnique({
      where: { id },
      include: {
        user: true,
        futsal: true,
      },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  async checkIfBookingExist(id: number) {
    const booking = await this.prismaService.booking.findUnique({
      where: { id },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
  }
}
