import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RefreshTokenService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async createRefreshToken(userId: string): Promise<string> {
    const refreshExpiration = this.config.get<string>('JWT_REFRESH_EXPIRATION') || '7d';

    // Parse the expiration string properly
    const expiresAt = new Date();
    if (refreshExpiration.endsWith('d')) {
      const days = parseInt(refreshExpiration.slice(0, -1)) || 7;
      expiresAt.setDate(expiresAt.getDate() + days);
    } else if (refreshExpiration.endsWith('h')) {
      const hours = parseInt(refreshExpiration.slice(0, -1)) || 168; // 7 days default
      expiresAt.setHours(expiresAt.getHours() + hours);
    } else {
      // Default to 7 days if format is not recognized
      expiresAt.setDate(expiresAt.getDate() + 7);
    }

    // Clean up old tokens for this user before creating new one
    await this.cleanupUserTokens(userId);

    const token = uuidv4();

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  private async cleanupUserTokens(userId: string): Promise<void> {
    // Delete expired and revoked tokens for this user only
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        OR: [{ expiresAt: { lt: new Date() } }, { isRevoked: true }],
      },
    });
  }

  async validateRefreshToken(token: string): Promise<{ userId: string }> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (refreshToken.isRevoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    return { userId: refreshToken.userId };
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  async rotateRefreshToken(oldToken: string): Promise<{ token: string; accessToken: string }> {
    const { userId } = await this.validateRefreshToken(oldToken);

    // Get user data
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Create new refresh token first
    const newRefreshToken = await this.createRefreshToken(userId);

    // Create new access token with full user data
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRATION') || '15m',
    });

    // Only revoke the old token after successfully creating new ones
    await this.revokeRefreshToken(oldToken);

    return {
      token: newRefreshToken,
      accessToken,
    };
  }
}
