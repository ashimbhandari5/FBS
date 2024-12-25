import { PartialType } from '@nestjs/mapped-types';
import { CreateFutsalDto } from './create-futsal.dto';

export class UpdateFutsalDto extends PartialType(CreateFutsalDto) {}
