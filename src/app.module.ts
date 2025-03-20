import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { FollowupModule } from './modules/followup/followup.module';
import { DepartmentModule } from './modules/department/department.module';
import { MilestoneModule } from './modules/milestone/milestone.module';
import { configuration } from './config/configuration';
import { HealthModule } from './modules/health/health.module';
import { MemberModule } from './modules/member/member.module';
import { ZonesModule } from './modules/zones/zones.module';
import { MailModule } from './mail/mail.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail/mail.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthService } from './modules/auth/auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }), // ✅ Load environment variables
    PrismaModule,
    AuthModule,
    FollowupModule,
    DepartmentModule,
    MilestoneModule,
    HealthModule,
    MemberModule,
    ZonesModule,
    MailModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAILTRAP_HOST'),
          port: configService.get<number>('MAILTRAP_PORT'),
          auth: {
            user: configService.get<string>('MAILTRAP_USER'),
            pass: configService.get<string>('MAILTRAP_PASS'),
          },
        },
        defaults: {
          from: `"${configService.get<string>('MAILTRAP_FROM_NAME')}" <${configService.get<string>('MAILTRAP_FROM_EMAIL')}>`,
        },
      }),
    }),

  ],
  providers: [AuthService, MailService, PrismaService],
  exports: [AuthService, MailService],
  controllers: [],
})
export class AppModule {}
