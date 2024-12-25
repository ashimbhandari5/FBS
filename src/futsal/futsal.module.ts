import { Module } from '@nestjs/common';
import { FutsalService } from './futsal.service';
import { FutsalController } from './futsal.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [FutsalController],
  providers: [FutsalService, PrismaService],
})
export class FutsalModule {}
