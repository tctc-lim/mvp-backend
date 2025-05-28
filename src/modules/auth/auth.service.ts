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
    private readonly mailService: MailService,
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
    // Generate a random password if not provided
    const password = userData.password || randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        mustChangePassword: true,
        resetToken,
      },
    });

    // Send welcome email with password setup link
    await this.mailService.sendWelcomeEmail(user.email, user.name, resetToken);

    return {
      message: 'User registered successfully. Please check your email to set your password.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
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

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return {
        message: 'If an account exists with this email, you will receive a password reset link.',
      };
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to user
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    // Send password reset email
    await this.mailService.sendPasswordReset(user.email, resetToken);

    return {
      message: 'If an account exists with this email, you will receive a password reset link.',
    };
  }
}
