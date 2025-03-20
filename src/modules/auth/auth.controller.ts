import { 
  Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, Request, UnauthorizedException, UseGuards 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, UpdateUserDto, ChangePasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async register(@Body() dto: RegisterDto, @Request() req) {
    const newUser = await this.authService.register(dto);
    return {
      message: 'User registered successfully.',
      user: newUser,
    };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }

  @Put('users/edit/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.updateUser(id, updateUserDto);
  }

  @Delete('users/delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }
}