import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import { MailerModule } from '@nestjs-modules/mailer';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { FollowupModule } from './modules/followup/followup.module';
import { DepartmentModule } from './modules/department/department.module';
import { MilestoneModule } from './modules/milestone/milestone.module';
import { MemberModule } from './modules/member/member.module';
import { ZonesModule } from './modules/zones/zones.module';
import { MailModule } from './mail/mail.module';
import { configuration } from './config/configuration';
import { loggerConfig } from './config/logger.config';
import { throttlerConfig } from './config/throttler.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
      load: [configuration],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => throttlerConfig,
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAILTRAP_HOST'),
          port: configService.get('MAILTRAP_PORT'),
          auth: {
            user: configService.get('MAILTRAP_USER'),
            pass: configService.get('MAILTRAP_PASS'),
          },
        },
        defaults: {
          from: `"${configService.get('MAILTRAP_FROM_NAME')}" <${configService.get('MAILTRAP_FROM_EMAIL')}>`,
        },
      }),
    }),
    WinstonModule.forRoot(loggerConfig),
    PrismaModule,
    AuthModule,
    HealthModule,
    MemberModule,
    ZonesModule,
    MailModule,
    FollowupModule,
    DepartmentModule,
    MilestoneModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
