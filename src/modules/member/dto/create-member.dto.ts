import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsInt,
  IsEnum,
  IsArray,
  IsDateString,
  Min,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  MemberStatus,
  ConversionStatus,
  InterestCategory,
  EducationLevel,
  AgeRange,
} from '@prisma/client';

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

  @ApiProperty({
    example: 'uuid-of-cell',
    description: 'Cell ID is required for member registration',
  })
  @IsString()
  @IsNotEmpty()
  cellId!: string;

  @ApiProperty({ enum: MemberStatus, required: false, description: 'Current member status' })
  @IsEnum(MemberStatus)
  @IsOptional()
  status?: MemberStatus;

  @ApiProperty({
    enum: ConversionStatus,
    required: false,
    description: 'Current conversion status',
  })
  @IsEnum(ConversionStatus)
  @IsOptional()
  conversionStatus?: ConversionStatus;

  @ApiProperty({ required: false, description: 'Number of Sunday services attended' })
  @IsInt()
  @Min(0)
  @IsOptional()
  sundayAttendance?: number;

  @ApiProperty({
    required: false,
    description: 'Date of first visit to church (for historical data)',
  })
  @IsDateString()
  @IsOptional()
  firstVisitDate?: string;

  @ApiProperty({ required: false, description: 'Date of conversion (for historical data)' })
  @IsDateString()
  @IsOptional()
  conversionDate?: string;

  @ApiProperty({
    description: 'Interests of the member',
    enum: InterestCategory,
    isArray: true,
    required: false,
    example: ['FREE_SKILLS', 'MOVIE_ACADEMY'],
  })
  @IsArray()
  @IsEnum(InterestCategory, { each: true })
  @IsOptional()
  interests?: InterestCategory[];

  @ApiProperty({
    description: 'Level of education',
    enum: EducationLevel,
    required: false,
    example: 'GRADUATE',
  })
  @IsEnum(EducationLevel)
  @IsOptional()
  educationLevel?: EducationLevel;

  @ApiProperty({
    description: 'Age range of the member',
    enum: AgeRange,
    required: false,
    example: 'AGE_21_30',
  })
  @IsEnum(AgeRange)
  @IsOptional()
  ageRange?: AgeRange;

  @ApiProperty({
    description: 'Birth date in DD-MM format (e.g., 15-01 for January 15th)',
    required: false,
    example: '15-01',
  })
  @IsString()
  @Matches(/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])$/, {
    message: 'Birth date must be in DD-MM format (e.g., 15-01 for January 15th)',
  })
  @IsOptional()
  birthDate?: string;

  @ApiProperty({
    description: 'Additional notes about member history',
    required: false,
    example: 'Member joined through cell outreach program',
  })
  @IsString()
  @IsOptional()
  historicalNotes?: string;

  @ApiProperty({
    required: false,
    description: 'Prayer request from the member',
    example: 'Pray for my family',
  })
  @IsString()
  @IsOptional()
  prayerRequest?: string;

  @ApiProperty({
    description: 'Negative feedback or concerns about the church/organization',
    required: false,
    example: 'Parking space needs improvement',
  })
  @IsString()
  @IsOptional()
  badComment?: string;
}
