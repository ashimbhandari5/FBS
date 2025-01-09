import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;
}
