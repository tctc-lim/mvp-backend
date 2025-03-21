import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(to: string, subject: string, html: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        html,
      });
      console.log(`Email sent successfully to ${to}`);
    } catch (error: unknown) {
      console.error(
        'Error sending email:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }
  }

  async sendPasswordReset(to: string, token: string) {
    const resetPasswordLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = `
      <h1>Password Reset Request</h1>
      <p>You have requested to reset your password. Click the link below to proceed:</p>
      <a href="${resetPasswordLink}">Reset Password</a>
      <p>If you did not request this password reset, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `;
    return this.sendMail(to, 'Password Reset Request', html);
  }
}
