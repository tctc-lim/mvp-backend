import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  Version,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  UpdateUserDto,
  ResetPasswordDto,
  ChangePasswordDto,
  ForgotPasswordDto,
} from './dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';
import { RefreshTokenService } from './services/refresh-token.service';
import { RefreshTokenDto, TokenResponseDto } from './dto/refresh-token.dto';

interface RequestWithUser extends ExpressRequest {
  user: { sub: string; email: string; role: UserRole };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  @Version('1')
  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async register(@Body() dto: RegisterDto) {
    const newUser = await this.authService.register(dto);
    return {
      message: 'User registered successfully.',
      user: newUser,
    };
  }

  @Version('1')
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Version('1')
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
  }

  @Version('1')
  @Get('users')
  @UseGuards(JwtAuthGuard)
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Version('1')
  @Get('users/:id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }

  @Version('1')
  @Put('users/edit/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.updateUser(id, updateUserDto);
  }

  @Version('1')
  @Delete('users/delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

  @Version('1')
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Returns new access and refresh tokens',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    try {
      const { token, accessToken } = await this.refreshTokenService.rotateRefreshToken(
        refreshTokenDto.refreshToken,
      );

      return {
        accessToken,
        refreshToken: token,
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  @Version('1')
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user and revoke refresh token' })
  @ApiResponse({ status: 200, description: 'Token revoked successfully' })
  async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<void> {
    await this.refreshTokenService.revokeRefreshToken(refreshTokenDto.refreshToken);
  }

  @Version('1')
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  async changePassword(@Request() req: RequestWithUser, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.sub, dto);
  }

  @Version('1')
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Version('1')
  @Get('debug/token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Debug endpoint to verify token validity' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  debugToken(@Request() req: RequestWithUser) {
    return {
      message: 'Token is valid',
      user: {
        id: req.user.sub,
        email: req.user.email,
        role: req.user.role,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
