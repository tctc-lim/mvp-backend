import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCellDto {
  @ApiProperty({ example: 'Cell A', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'uuid-of-zone', required: false })
  @IsUUID()
  @IsOptional()
  zoneId?: string;

  @ApiProperty({ example: 'uuid-of-leader', required: false })
  @IsUUID()
  @IsOptional()
  userId?: string;
}
