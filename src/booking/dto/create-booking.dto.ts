import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsNotEmpty()
  @IsInt()
  futsalId: number;

  @IsNotEmpty()
  @IsString()
  booking_date: string;

  @IsNotEmpty()
  @IsInt()
  start_time: number;

  @IsNotEmpty()
  @IsInt()
  end_time: number;

  @IsNotEmpty()
  @IsInt()
  price: number;

  @IsNotEmpty()
  @IsString()
  status: string;
}
