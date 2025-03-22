import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Check API health status' })
  async check() {
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT current_database(), current_schema(), version()`;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        api: {
          version: '1.0',
          environment: process.env.NODE_ENV,
          baseUrl:
            process.env.NODE_ENV === 'production'
              ? 'https://api.churchkyc.com/api/v1'
              : `http://localhost:${process.env.PORT || 3000}/api/v1`,
          docsUrl:
            process.env.NODE_ENV === 'production'
              ? 'https://api.churchkyc.com/api-docs'
              : `http://localhost:${process.env.PORT || 3000}/api-docs`,
        },
        database: {
          status: 'connected',
          name: process.env.DATABASE_URL?.split('/').pop()?.split('?')[0],
        },
        cors: {
          origin: process.env.CORS_ORIGIN || '*',
        },
      };
    } catch (error: unknown) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        api: {
          version: '1.0',
          environment: process.env.NODE_ENV,
        },
        database: {
          status: 'disconnected',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}
