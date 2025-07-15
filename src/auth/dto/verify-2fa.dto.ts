import { IsNotEmpty, IsString } from 'class-validator';

export class Verify2FaDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}