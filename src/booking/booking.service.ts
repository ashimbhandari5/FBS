// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { CreateBookingDto } from './dto/create-booking.dto';
// import { UpdateBookingDto } from './dto/update-booking.dto';

// @Injectable()
// export class BookingService {
//   constructor(private readonly prismaService: PrismaService) {}

//   async create(createBookingDto: CreateBookingDto) {
//     return this.prismaService.booking.create({
//       data: {
//         booking_date: createBookingDto.booking_date,
//         start_time: createBookingDto.start_time,
//         end_time: createBookingDto.end_time,
//         price: createBookingDto.price,
//         status: createBookingDto.status,
//         user: {
//           connect: { id: createBookingDto.userId },
//         },
//         futsal: {
//           connect: { id: createBookingDto.futsalId },
//         },
//       },
//     });
//   }

//   async findAll() {
//     return this.prismaService.booking.findMany({
//       include: {
//         user: true,
//         futsal: true,
//       },
//     });
//   }

//   async findOne(id: number) {
//     const booking = await this.prismaService.booking.findUnique({
//       where: { id },
//       include: {
//         user: true,
//         futsal: true,
//       },
//     });
//     if (!booking) {
//       throw new NotFoundException(`Booking with ID ${id} not found`);
//     }
//     return booking;
//   }

//   async update(id: number, updateBookingDto: UpdateBookingDto) {
//     await this.checkIfBookingExist(id);
//     return this.prismaService.booking.update({
//       where: { id },
//       data: {
//         booking_date: updateBookingDto.booking_date,
//         start_time: updateBookingDto.start_time,
//         end_time: updateBookingDto.end_time,
//         price: updateBookingDto.price,
//         status: updateBookingDto.status,
//         user: updateBookingDto.userId
//           ? { connect: { id: updateBookingDto.userId } }
//           : undefined,
//         futsal: updateBookingDto.futsalId
//           ? { connect: { id: updateBookingDto.futsalId } }
//           : undefined,
//       },
//     });
//   }

//   async remove(id: number) {
//     await this.checkIfBookingExist(id);
//     return this.prismaService.booking.delete({
//       where: { id },
//     });
//   }

//   async getBookingById(id: number) {
//     const booking = await this.prismaService.booking.findUnique({
//       where: { id },
//       include: {
//         user: true,
//         futsal: true,
//       },
//     });
//     if (!booking) {
//       throw new NotFoundException(`Booking with ID ${id} not found`);
//     }
//     return booking;
//   }

//   async checkIfBookingExist(id: number) {
//     const booking = await this.prismaService.booking.findUnique({
//       where: { id },
//     });
//     if (!booking) {
//       throw new NotFoundException(`Booking with ID ${id} not found`);
//     }
//   }
// }

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Prisma } from '@prisma/client';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  update(arg0: number, updateBookingDto: UpdateBookingDto) {
    throw new Error('Method not implemented.');
  }
  remove(arg0: number) {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly prismaService: PrismaService) {}

  private async acquireLock(
    futsalId: number,
    booking_date: string,
    start_time: number,
    end_time: number,
  ) {
    // Use pessimistic locking
    const lock = await this.prismaService.$queryRaw`
      SELECT id FROM bookings
      WHERE futsal_id = ${futsalId}
      AND booking_date = ${booking_date}
      AND (
        (start_time <= ${start_time} AND end_time > ${start_time})
        OR
        (start_time < ${end_time} AND end_time >= ${end_time})
      )
      FOR UPDATE SKIP LOCKED
    `;
    return lock;
  }

  private async checkForConflict(createBookingDto: CreateBookingDto) {
    const existingBooking = await this.prismaService.booking.findFirst({
      where: {
        futsalId: createBookingDto.futsalId,
        booking_date: createBookingDto.booking_date,
        OR: [
          {
            AND: [
              { start_time: { lte: createBookingDto.start_time } },
              { end_time: { gt: createBookingDto.start_time } },
            ],
          },
          {
            AND: [
              { start_time: { lt: createBookingDto.end_time } },
              { end_time: { gte: createBookingDto.end_time } },
            ],
          },
        ],
        status: 'PENDING',
      },
      include: {
        user: true,
      },
    });

    return existingBooking;
  }

  async create(createBookingDto: CreateBookingDto) {
    // Start transaction with serializable isolation level
    return this.prismaService.$transaction(
      async (prisma) => {
        // Acquire lock for the time slot
        await this.acquireLock(
          createBookingDto.futsalId,
          createBookingDto.booking_date,
          createBookingDto.start_time,
          createBookingDto.end_time,
        );

        // Check for conflicts
        const conflictingBooking =
          await this.checkForConflict(createBookingDto);

        if (conflictingBooking) {
          // Get current user's points
          const currentUser = await prisma.user.findUnique({
            where: { id: createBookingDto.userId },
          });

          if (!currentUser) {
            throw new NotFoundException('User not found');
          }

          // If current user has more points, cancel conflicting booking and create new one
          if (currentUser.points > conflictingBooking.user.points) {
            // Cancel conflicting booking without point deduction since it's system cancellation
            await prisma.booking.update({
              where: { id: conflictingBooking.id },
              data: { status: 'CANCELLED' },
            });

            // Create new booking and increment points
            const booking = await prisma.booking.create({
              data: {
                booking_date: createBookingDto.booking_date,
                start_time: createBookingDto.start_time,
                end_time: createBookingDto.end_time,
                price: createBookingDto.price,
                status: 'CONFIRMED',
                user: { connect: { id: createBookingDto.userId } },
                futsal: { connect: { id: createBookingDto.futsalId } },
              },
            });

            // Increment points for successful booking
            await prisma.user.update({
              where: { id: createBookingDto.userId },
              data: { points: { increment: 2 } },
            });

            return booking;
          } else {
            throw new ConflictException(
              'Slot already booked by user with higher points',
            );
          }
        }

        // No conflict, create booking normally
        const booking = await prisma.booking.create({
          data: {
            booking_date: createBookingDto.booking_date,
            start_time: createBookingDto.start_time,
            end_time: createBookingDto.end_time,
            price: createBookingDto.price,
            status: 'CONFIRMED',
            user: { connect: { id: createBookingDto.userId } },
            futsal: { connect: { id: createBookingDto.futsalId } },
          },
        });

        // Increment points for successful booking
        await prisma.user.update({
          where: { id: createBookingDto.userId },
          data: { points: { increment: 2 } },
        });

        return booking;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // Ensure serializable isolation
      },
    );
  }

  async cancelManually(id: number) {
    return this.prismaService.$transaction(async (prisma) => {
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!booking) {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }

      // Update booking status
      await prisma.booking.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      // Decrement user points only for manual cancellation
      await prisma.user.update({
        where: { id: booking.user.id },
        data: { points: { decrement: 4 } },
      });

      return { message: 'Booking cancelled successfully' };
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
}
