import { IsString, IsOptional, IsEnum, IsInt, IsEmail } from 'class-validator';
import { MemberStatus, ConversionStatus } from '@prisma/client';

export class CreateMemberDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsString()
  gender: string;

  @IsEnum(MemberStatus)
  @IsOptional()
  status?: MemberStatus;

  @IsEnum(ConversionStatus)
  @IsOptional()
  conversionStatus?: ConversionStatus;

  @IsString()
  zoneId: string; // Required field

  @IsOptional()
  @IsString()
  cellId?: string;

  @IsOptional()
  @IsInt()
  sundayAttendance?: number;
}