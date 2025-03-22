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
      await this.prisma.$queryRaw`SELECT current_database(), current_schema(), version()`;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: {
          status: 'connected',
          url: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'), // Mask password
        },
        environment: process.env.NODE_ENV,
        port: process.env.PORT,
      };
    } catch (error: unknown) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: {
          status: 'disconnected',
          url: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'), // Mask password
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        environment: process.env.NODE_ENV,
        port: process.env.PORT,
      };
    }
  }
}
