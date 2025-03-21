import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto, LoginDto, UpdateUserDto, ChangePasswordDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { User } from '@prisma/client';
import { randomBytes } from 'crypto'; // For generating token
import { RefreshTokenService } from './services/refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService, // ✅ Use Mailtrap API service
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  // ✅ Generate JWT
  async generateJwt(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };
    return this.jwtService.signAsync(payload);
  }

  async register(userData: RegisterDto) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetPasswordLink = `https://localhost:3001/reset-password?token=${resetToken}`;

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        mustChangePassword: true,
        resetToken,
      },
    });

    // ✅ Send email via Mailtrap SMTP
    await this.mailService.sendMail(
      user.email,
      'Welcome to Our Platform - Set Your Password',
      `<h1>Welcome, ${user.name}!</h1>
            <p>Click the link below to set your password:</p>
            <a href="${resetPasswordLink}">Set Your Password</a>`,
    );

    return { message: 'User registered. Check your email to set your password.' };
  }

  // ✅ Reset Password (Uses token & invalidates it after reset)
  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({ where: { resetToken: token } });

    if (!user) throw new BadRequestException('Invalid or expired reset token');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false, // ✅ Allow normal login
        resetToken: null, // ✅ Invalidate reset token
      },
    });

    return { message: 'Password reset successful. You can now log in.' };
  }

  // ✅ User Login
  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    // Generate access token
    const accessToken = await this.jwtService.signAsync(payload);

    // Generate refresh token
    const refreshToken = await this.refreshTokenService.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    };
  }

  // ✅ Get All Users
  async getAllUsers() {
    return this.prisma.user.findMany();
  }

  // ✅ Get User by ID
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  // ✅ Update User (Now includes phone)
  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        phone: updateUserDto.phone, // ✅ Ensure phone updates
      },
    });
  }

  // ✅ Delete User
  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.delete({ where: { id } });

    return { message: 'User deleted successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }
}
