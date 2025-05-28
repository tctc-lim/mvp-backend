import { Injectable, Logger } from '@nestjs/common';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiInstance: SibApiV3Sdk.TransactionalEmailsApi;

  constructor() {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not defined');
    }
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.sender = {
        name: process.env.BREVO_FROM_NAME || 'KYM System',
        email: process.env.BREVO_FROM_EMAIL || 'no-reply@thecasualtech.com',
      };
      sendSmtpEmail.to = [{ email: to }];

      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error: unknown) {
      this.logger.error(
        'Error sending email:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }
  }

  async sendPasswordReset(to: string, token: string) {
    const resetPasswordLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
          <p style="color: #666; font-size: 16px;">You have requested to reset your password. Click the button below to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetPasswordLink}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">If you did not request this password reset, please ignore this email.</p>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `;
    return this.sendMail(to, 'Reset Your Password - KYM System', html);
  }

  async sendWelcomeEmail(to: string, name: string, resetToken: string) {
    const resetPasswordLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Welcome to KYM System!</h1>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
          <p style="color: #666; font-size: 16px;">Hello ${name},</p>
          <p style="color: #666; font-size: 16px;">Welcome to KYM System! To get started, please set your password by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetPasswordLink}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Set Your Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `;
    return this.sendMail(to, 'Welcome to KYM System - Set Your Password', html);
  }
}
