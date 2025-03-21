import { IsString, IsNotEmpty, IsEmail, IsOptional, IsInt, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MemberStatus, ConversionStatus } from '@prisma/client';

export class CreateMemberDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ example: 'male', enum: ['male', 'female'] })
  @IsString()
  @IsNotEmpty()
  gender!: string;

  @ApiProperty({ example: 'uuid-of-zone' })
  @IsString()
  @IsNotEmpty()
  zoneId!: string;

  @IsEnum(MemberStatus)
  @IsOptional()
  status?: MemberStatus;

  @IsEnum(ConversionStatus)
  @IsOptional()
  conversionStatus?: ConversionStatus;

  @IsOptional()
  @IsString()
  cellId?: string;

  @IsOptional()
  @IsInt()
  sundayAttendance?: number;
}
