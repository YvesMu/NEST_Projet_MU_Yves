import { IsString, IsOptional, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMovieDto {
  @ApiProperty({
    description: 'Titre du film',
    example: 'The Matrix',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Description du film',
    example: 'Un programmeur découvre que la réalité telle qu\'il la connaît n\'existe pas.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Genre du film',
    example: 'Science-Fiction',
  })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({
    description: 'Réalisateur du film',
    example: 'Lana Wachowski, Lilly Wachowski',
  })
  @IsOptional()
  @IsString()
  director?: string;

  @ApiPropertyOptional({
    description: 'Année de sortie',
    example: 1999,
    minimum: 1900,
    maximum: 2030,
  })
  @IsOptional()
  @IsNumber()
  releaseYear?: number;

  @ApiPropertyOptional({
    description: 'Note du film (0-10)',
    example: 8.7,
    minimum: 0,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Film déjà regardé',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isWatched?: boolean;

  @ApiPropertyOptional({
    description: 'Avis personnel sur le film',
    example: 'Un chef-d\'œuvre du cinéma de science-fiction !',
  })
  @IsOptional()
  @IsString()
  review?: string;
}