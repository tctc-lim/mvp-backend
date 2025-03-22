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
  ) { }

  @Get()
  @ApiOperation({ summary: 'Check API health status' })
  async check() {
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT current_database(), current_schema(), version()`;

      // Use the current request URL as base URL
      const port = process.env.PORT || 3000;
      const baseUrl = `http://localhost:${port}`;
      // Use the current request URL as base URL
      const port = process.env.PORT || 3000;
      const baseUrl = `http://localhost:${port}`;

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
          url: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'), // Mask password
          url: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'), // Mask password
        },
        cors: {
          origin: this.configService.get('cors.origin') || '*',
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
          url: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'), // Mask password
          url: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'), // Mask password
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      };
    }
  }
}