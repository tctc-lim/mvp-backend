import { IsString, IsOptional, IsEnum, IsUUID, IsDate } from 'class-validator';
import { FollowUpType, FollowUpStatus } from '@prisma/client';

export class CreateFollowUpDto {
  @IsUUID()
  memberId: string;

  @IsEnum(FollowUpType)
  type: FollowUpType;

  @IsOptional()
  @IsEnum(FollowUpStatus)
  status?: FollowUpStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsDate()
  nextFollowUpDate?: Date;
}
