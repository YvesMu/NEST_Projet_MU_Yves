import { Controller, Post, Get, Body, HttpCode, HttpStatus, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Verify2FaDto } from './dto/verify-2fa.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-2fa')
  @HttpCode(HttpStatus.OK)
  async verify2FA(@Body() verify2FaDto: Verify2FaDto) {
    return this.authService.verify2FA(verify2FaDto);
  }

  // Endpoint GET pour vérification email (clic sur lien)
  @Get('verify-email')
  async verifyEmailGet(
    @Query('token') token: string, 
    @Query('email') email: string,
    @Res() res: Response
  ) {
    try {
      const result = await this.authService.verifyEmail(token, email);
      
      // Page de succès
      const successPage = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Verification - Movie Watchlist</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              padding: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container { 
              background: white;
              max-width: 500px; 
              margin: 0 auto;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
              text-align: center;
            }
            .success { color: #28a745; margin-bottom: 20px; }
            .btn { 
              background-color: #007bff; 
              color: white; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px;
              display: inline-block;
              margin-top: 20px;
              transition: background-color 0.3s;
            }
            .btn:hover { background-color: #0056b3; }
            .icon { font-size: 48px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">🎬</div>
            <h1 class="success">✅ Email Verified Successfully!</h1>
            <p>Welcome to Movie Watchlist!</p>
            <p>Your email has been verified. You can now log in and start building your movie collection.</p>
            <a href="http://localhost:3000" class="btn">Continue to App</a>
          </div>
        </body>
        </html>
      `;
      
      res.send(successPage);
    } catch (error) {
      // Page d'erreur
      const errorPage = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Verification Failed - Movie Watchlist</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
              margin: 0;
              padding: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container { 
              background: white;
              max-width: 500px; 
              margin: 0 auto;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
              text-align: center;
            }
            .error { color: #dc3545; margin-bottom: 20px; }
            .btn { 
              background-color: #007bff; 
              color: white; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px;
              display: inline-block;
              margin-top: 20px;
            }
            .icon { font-size: 48px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">❌</div>
            <h1 class="error">Verification Failed</h1>
            <p>The verification link is invalid or has expired.</p>
            <p>Please try registering again or contact support.</p>
            <a href="http://localhost:3000" class="btn">Back to Home</a>
          </div>
        </body>
        </html>
      `;
      
      res.send(errorPage);
    }
  }

  // Endpoint POST pour vérification email (API)
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmailPost(@Query('token') token: string, @Query('email') email: string) {
    return this.authService.verifyEmail(token, email);
  }
}