import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/entities/user.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(user: User, verificationToken: string) {
    const url = `http://localhost:3000/auth/verify-email?token=${verificationToken}&email=${user.email}`;
    
    try {
      this.logger.log(`Sending verification email to ${user.email}`);
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Movie Watchlist - Email Verification',
        html: `
          <h1>Hello ${user.name}!</h1>
          <p>Please click the link below to verify your email address:</p>
          <a href="${url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        `,
      });
      this.logger.log(`Verification email sent successfully to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${user.email}`, error);
      throw error;
    }
  }

  async sendTwoFactorCode(user: User, code: string) {
    try {
      this.logger.log(`Sending 2FA code to ${user.email}`);
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Movie Watchlist - Two-Factor Authentication Code',
        html: `
          <h1>Hello ${user.name}!</h1>
          <p>Your two-factor authentication code is:</p>
          <h2 style="color: #007bff; font-size: 32px; letter-spacing: 5px; text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">${code}</h2>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        `,
      });
      this.logger.log(`2FA email sent successfully to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send 2FA email to ${user.email}`, error);
      throw error;
    }
  }
}