import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check API health status' })
  async check() {
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT current_database(), current_schema(), version()`;

      const baseUrl =
        this.configService.get('API_URL') || `http://localhost:${process.env.PORT || 3000}`;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        api: {
          version: '1.0',
          environment: process.env.NODE_ENV,
          baseUrl: `${baseUrl}/api/v1`,
          docsUrl: `${baseUrl}/api-docs`,
        },
        database: {
          status: 'connected',
          name: process.env.DATABASE_URL?.split('/').pop()?.split('?')[0],
        },
        cors: {
          origin: this.configService.get('CORS_ORIGIN') || '*',
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
