import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MemberStatus, ConversionStatus } from '@prisma/client';
import { Transform } from 'class-transformer';

export class MemberQueryDto {
  @ApiProperty({ enum: MemberStatus, required: false })
  @IsEnum(MemberStatus)
  @IsOptional()
  status?: MemberStatus;

  @ApiProperty({ enum: ConversionStatus, required: false })
  @IsEnum(ConversionStatus)
  @IsOptional()
  conversionStatus?: ConversionStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  zoneId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  cellId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false, description: 'Filter by first visit date range start' })
  @IsDateString()
  @IsOptional()
  firstVisitStart?: string;

  @ApiProperty({ required: false, description: 'Filter by first visit date range end' })
  @IsDateString()
  @IsOptional()
  firstVisitEnd?: string;

  @ApiProperty({ required: false, description: 'Filter by last visit date range start' })
  @IsDateString()
  @IsOptional()
  lastVisitStart?: string;

  @ApiProperty({ required: false, description: 'Filter by last visit date range end' })
  @IsDateString()
  @IsOptional()
  lastVisitEnd?: string;

  @ApiProperty({ required: false, default: 10 })
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({ required: false, default: 0 })
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  offset?: number = 0;
}
