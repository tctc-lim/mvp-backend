import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, UpdateUserDto } from './dto/auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';


@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN') // Only SUPER_ADMIN can register users
    async register(@Body() dto: RegisterDto, @Request() req) {
        const newUser = await this.authService.register(dto, req.user.id);
        // Send email to the new user with credentials
        await this.authService.sendRegistrationEmail(newUser.user.email, dto.password, newUser.user.name, newUser.user.role);
        return {
            message: 'User registered successfully. Email sent with login details.',
            user: newUser
        };
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Get('users')
    async getUsers() {
      return this.authService.getAllUsers();
    }

    @Put('update/:id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.updateUser(id, updateUserDto);
  }

  @Delete('delete/:id')
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }
}
