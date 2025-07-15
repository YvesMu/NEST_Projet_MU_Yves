import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('test-verification')
  async testVerificationEmail(@Body() body: { email: string; name: string }) {
    const mockUser = {
      email: body.email,
      name: body.name,
    } as any;
    
    const verificationToken = 'test-token-123';
    
    try {
      await this.emailService.sendVerificationEmail(mockUser, verificationToken);
      return { success: true, message: 'Verification email sent successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('test-2fa')
  async testTwoFactorEmail(@Body() body: { email: string; name: string }) {
    const mockUser = {
      email: body.email,
      name: body.name,
    } as any;
    
    const code = '123456';
    
    try {
      await this.emailService.sendTwoFactorCode(mockUser, code);
      return { success: true, message: '2FA email sent successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}