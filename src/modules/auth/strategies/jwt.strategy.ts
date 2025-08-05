import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  mustChangePassword?: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    try {
      if (!payload.sub) {
        console.error('Invalid token payload - missing sub:', payload);
        throw new UnauthorizedException('Invalid token payload - missing user ID');
      }

      if (!payload.email) {
        console.error('Invalid token payload - missing email:', payload);
        throw new UnauthorizedException('Invalid token payload - missing email');
      }

      if (!payload.role) {
        console.error('Invalid token payload - missing role:', payload);
        throw new UnauthorizedException('Invalid token payload - missing role');
      }

      return {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        mustChangePassword: payload.mustChangePassword,
      };
    } catch (error) {
      console.error('JWT validation error:', error);
      throw error;
    }
  }
}
