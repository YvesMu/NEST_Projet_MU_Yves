import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Verify2FaDto {
  @ApiProperty({
    description: 'Code à 6 chiffres reçu par email',
    example: '123456',
    pattern: '^[0-9]{6}$',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Token temporaire reçu lors de la connexion',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}