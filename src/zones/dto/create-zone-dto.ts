import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateZoneDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  userId: string; // Coordinator user ID
}