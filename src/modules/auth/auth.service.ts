import { Injectable, UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto, UpdateUserDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private mailerService: MailerService,
    ) { }

    async register(dto: RegisterDto, requestingUserId: string) {
        // Fetch the user who is making the request
        const requestingUser = await this.prisma.user.findUnique({
            where: { id: requestingUserId },
        });

        if (!requestingUser || requestingUser.role !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Only SUPER_ADMIN can register new users');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // Create user in the database
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                name: dto.name,
                role: dto.role,
                mustChangePassword: true
            },
        });

        // Send registration email
        await this.sendRegistrationEmail(user.email, dto.password, user.name, user.role);

        return {
            message: 'User registered successfully. Login details have been sent via email.',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if user must change their password
        if (user.mustChangePassword) {
            throw new UnauthorizedException('You must change your password before proceeding.');
        }

        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }

    async sendRegistrationEmail(email: string, password: string, name: string, role: string) {
        await this.mailerService.sendMail({
            to: email,
            subject: 'Welcome to Church KYC Management System',
            template: './welcome', // Template in /templates folder
            context: {
                name,
                email,
                password,
                role,
            },
        });
    }

    async getAllUsers() {
        return await this.prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        });
    }

    async updateUser(userId: string, updateUserDto: UpdateUserDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
        if (!user) {
          throw new NotFoundException('User not found');
        }
    
        return this.prisma.user.update({
          where: { id: userId },
          data: updateUserDto,
        });
      }
    
      async deleteUser(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
        if (!user) {
          throw new NotFoundException('User not found');
        }
    
        await this.prisma.user.delete({ where: { id: userId } });
    
        return { message: 'User deleted successfully' };
      }
}
