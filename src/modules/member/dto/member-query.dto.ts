import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  MemberStatus,
  ConversionStatus,
  AgeRange,
  EducationLevel,
  InterestCategory,
} from '@prisma/client';
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

  @ApiProperty({ required: false, enum: ['male', 'female'] })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({ enum: AgeRange, required: false })
  @IsEnum(AgeRange)
  @IsOptional()
  ageRange?: AgeRange;

  @ApiProperty({ enum: EducationLevel, required: false })
  @IsEnum(EducationLevel)
  @IsOptional()
  educationLevel?: EducationLevel;

  @ApiProperty({
    enum: InterestCategory,
    required: false,
    description: 'Filter by interest - members with this interest will be included',
  })
  @IsEnum(InterestCategory)
  @IsOptional()
  interests?: InterestCategory;

  @ApiProperty({ required: false, description: 'Filter by birth month (1-12)' })
  @IsString()
  @IsOptional()
  birthMonth?: string;

  @ApiProperty({
    required: false,
    description:
      'Filter by first visit date - if only start is provided, filters for that specific date',
  })
  @IsDateString()
  @IsOptional()
  firstVisitStart?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by first visit date range end (optional if filtering single date)',
  })
  @IsDateString()
  @IsOptional()
  firstVisitEnd?: string;

  @ApiProperty({
    required: false,
    description:
      'Filter by last visit date - if only start is provided, filters for that specific date',
  })
  @IsDateString()
  @IsOptional()
  lastVisitStart?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by last visit date range end (optional if filtering single date)',
  })
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
