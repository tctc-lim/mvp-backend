import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'The refresh token',
    example: 'a8b7c6d5-e4f3-g2h1-i0j9-k8l7m6n5o4p3',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class TokenResponseDto {
  @ApiProperty({
    description: 'The new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'The new refresh token',
    example: 'a8b7c6d5-e4f3-g2h1-i0j9-k8l7m6n5o4p3',
  })
  refreshToken!: string;
}
