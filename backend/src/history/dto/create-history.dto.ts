import { IsArray, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateHistoryItemDto {
  @IsString()
  exerciseId: string;

  @IsNumber()
  sets: number;

  @IsNumber()
  reps: number;

  @IsNumber()
  @IsOptional()
  weight?: number;
}

export class CreateHistoryDto {
  @IsString()
  routineId: string;

  @IsString()
  name: string; 

  @IsDateString()
  startedAt: string; 

  @IsDateString()
  endedAt: string; 
  @IsArray()
  items: CreateHistoryItemDto[];
}