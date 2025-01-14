import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoleModule } from './role/role.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { FutsalModule } from './futsal/futsal.module';
import { BookingModule } from './booking/booking.module';
import { ProfileModule } from './profile/profile.module';
import { AuthModule } from './authentication/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    RoleModule,
    PrismaModule,
    UserModule,
    FutsalModule,
    BookingModule,
    ProfileModule,
    AuthModule,
    ConfigModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
