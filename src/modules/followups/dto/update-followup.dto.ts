import { IsString, IsOptional, IsEnum, IsUUID, IsDate } from 'class-validator';
import { FollowUpType, FollowUpStatus } from '@prisma/client';

export class UpdateFollowUpDto {
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @IsOptional()
  @IsEnum(FollowUpType)
  type?: FollowUpType;

  @IsOptional()
  @IsEnum(FollowUpStatus)
  status?: FollowUpStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsDate()
  nextFollowUpDate?: Date;
}
