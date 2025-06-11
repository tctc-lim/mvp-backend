import { IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkAttendanceDto {
  @ApiProperty({ required: false, description: 'Date of attendance (defaults to current date)' })
  @IsDateString()
  @IsOptional()
  attendanceDate?: string;
}
