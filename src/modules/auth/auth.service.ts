import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto, LoginDto, UpdateUserDto, ChangePasswordDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '@prisma/client'; // Import User type

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService,
    ) { }
    
    // ✅ Generate JWT
    async generateJwt(user: Partial<User>): Promise<string> {
        return this.jwtService.signAsync({
            sub: user.id,
            email: user.email,
            role: user.role,
            mustChangePassword: user.mustChangePassword, // Include this
        });
    }

    // ✅ User Registration
    async register(userData: RegisterDto, id: any) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const user = await this.prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword,
                mustChangePassword: true, // Ensure first login enforcement
            },
        });

        return { message: 'User registered successfully. Please check your email for login details.' };
    }

    // ✅ User Login
    async login(credentials: LoginDto) {
        const user = await this.prisma.user.findUnique({ where: { email: credentials.email } });

        if (!user) throw new UnauthorizedException('Invalid credentials');

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

        const token = await this.generateJwt(user);

        return {
            message: user.mustChangePassword
                ? 'Login successful, but you must change your password before accessing the dashboard.'
                : 'Login successful',
            token,
            mustChangePassword: user.mustChangePassword,
        };
    }

    // ✅ Get All Users
    async getAllUsers() {
        return this.prisma.user.findMany();
    }

    // ✅ Get User By ID
    async getUserById(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    // ✅ Update User
    async updateUser(id: string, updateUserDto: UpdateUserDto) {
        return this.prisma.user.update({
            where: { id },
            data: updateUserDto,
        });
    }

    // ✅ Delete User
    async deleteUser(id: string) {
        return this.prisma.user.delete({ where: { id } });
    }

    // ✅ First-Time Password Change (One-Time Only)
    async firstTimePasswordChange(email: string, oldPassword: string, newPassword: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new NotFoundException('User not found');

        if (user.mustChangePassword) {
            throw new ForbiddenException('You have already changed your password');
        }

        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatch) throw new UnauthorizedException('Old password is incorrect');

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUser = await this.prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                mustChangePassword: false, // Allow normal login after this
            },
            select: { id: true, email: true, role: true, mustChangePassword: true },
        });

        const token = await this.generateJwt(updatedUser);
        return { message: 'Password updated successfully. You can now log in.', token };
    }

    async changePassword(dto: ChangePasswordDto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    
        if (!user) {
            throw new NotFoundException('User not found');
        }
    
        // Prevent multiple password changes
        if (!user.mustChangePassword) {
            throw new ForbiddenException('You have already changed your password.');
        }
    
        const isPasswordValid = await bcrypt.compare(dto.oldPassword, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Old password is incorrect');
        }
    
        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    
        await this.prisma.user.update({
            where: { email: dto.email },
            data: { 
                password: hashedPassword, 
                mustChangePassword: false // Ensure it's only changed once
            },
        });
    
        return { message: 'Password changed successfully. You can now log in.' };
    }
    
}
