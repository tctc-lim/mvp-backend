import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
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
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
