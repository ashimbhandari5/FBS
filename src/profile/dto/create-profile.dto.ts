import { IsIn, IsInt, IsNotEmpty } from 'class-validator';

export class CreateProfileDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsNotEmpty()
  @IsInt()
  points: number;
}
