import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Department name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Head of Department name' })
  @IsString()
  @IsOptional()
  hodName?: string;

  @ApiPropertyOptional({ description: 'Head of Department phone number' })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9+\-\s()]+$/, {
    message: 'Phone number must contain only digits, spaces, hyphens, parentheses, or plus signs',
  })
  hodPhone?: string;
}
