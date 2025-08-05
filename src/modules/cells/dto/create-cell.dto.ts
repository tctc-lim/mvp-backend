import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCellDto {
  @ApiProperty({ example: 'Cell A' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'uuid-of-zone' })
  @IsUUID()
  @IsNotEmpty()
  zoneId!: string;

  @ApiProperty({ example: 'uuid-of-leader' })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;
}
