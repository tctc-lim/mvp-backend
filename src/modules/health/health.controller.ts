import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        environment: process.env.NODE_ENV,
      };
    } catch (error: unknown) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
