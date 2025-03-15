import { UserRole } from '@prisma/client';
export declare class RegisterDto {
    email: string;
    password: string;
    name: string;
    role: UserRole;
}
export declare class LoginDto {
    email: string;
    password: string;
}
