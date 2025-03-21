import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateZoneDto {
  @ApiProperty({ example: 'North Zone' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Zone description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'uuid-of-coordinator' })
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
