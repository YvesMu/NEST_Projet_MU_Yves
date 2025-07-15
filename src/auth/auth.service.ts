import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Verify2FaDto } from './dto/verify-2fa.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Créer l'utilisateur
    const user = await this.usersService.create(registerDto);

    // Générer un token de vérification d'email
    const emailVerificationToken = uuidv4();
    await this.usersService.update(user.id, {
      emailVerificationToken,
    });

    // Envoyer l'email de vérification
    await this.emailService.sendVerificationEmail(user, emailVerificationToken);
    
    return {
      message: 'User registered successfully. Please check your email for verification.',
      userId: user.id,
    };
  }

  async login(loginDto: LoginDto) {
    // Vérifier les identifiants
    const user = await this.validateUser(loginDto.email, loginDto.password);

    // Vérifier si l'email est vérifié
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    // Générer un code 2FA
    const twoFactorCode = this.generateTwoFactorCode();
    const twoFactorCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.usersService.updateTwoFactorCode(
      user.id,
      twoFactorCode,
      twoFactorCodeExpiry,
    );

    // Générer un token temporaire pour la 2FA
    const tempToken = this.jwtService.sign(
      { sub: user.id, type: 'temp' },
      { expiresIn: '15m' },
    );

    // Envoyer l'email avec le code 2FA
    await this.emailService.sendTwoFactorCode(user, twoFactorCode);

    return {
      message: 'Two-factor authentication code sent to your email',
      tempToken,
    };
  }

  async verify2FA(verify2FaDto: Verify2FaDto) {
    // Décoder le token temporaire
    let decoded;
    try {
      decoded = this.jwtService.verify(verify2FaDto.token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (decoded.type !== 'temp') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.usersService.findOne(decoded.sub);

    // Vérifier le code 2FA
    if (
      !user.twoFactorCode ||
      user.twoFactorCode !== verify2FaDto.code ||
      !user.twoFactorCodeExpiry ||
      user.twoFactorCodeExpiry < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired 2FA code');
    }

    // Supprimer le code 2FA
    await this.usersService.updateTwoFactorCode(user.id, undefined, undefined);

    // Générer le token JWT final
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async verifyEmail(token: string, email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.emailVerificationToken !== token) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.usersService.updateEmailVerificationStatus(user.id, true);

    return { message: 'Email verified successfully' };
  }

  private async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private generateTwoFactorCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}