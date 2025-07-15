import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Role } from '../common/enums/roles.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('movies')
@Controller('movies')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @ApiOperation({ summary: 'Ajouter un film à sa watchlist' })
  @ApiResponse({ status: 201, description: 'Film ajouté avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async create(@Body() createMovieDto: CreateMovieDto, @GetUser() user: User) {
    return this.moviesService.create(createMovieDto, user);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Récupérer ses films', 
    description: 'Un utilisateur voit seulement ses films. Un admin voit tous les films de tous les utilisateurs.' 
  })
  @ApiResponse({ status: 200, description: 'Liste des films récupérée' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async findAll(@GetUser() user: User) {
    return this.moviesService.findAll(user);
  }

  @Get('watched')
  @ApiOperation({ summary: 'Récupérer les films déjà regardés' })
  @ApiResponse({ status: 200, description: 'Liste des films regardés' })
  async getWatchedMovies(@GetUser() user: User) {
    return this.moviesService.getWatchedMovies(user);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Statistiques de sa watchlist' })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques : total, regardés, non regardés, note moyenne',
    schema: {
      type: 'object',
      properties: {
        totalMovies: { type: 'number', example: 25 },
        watchedMovies: { type: 'number', example: 15 },
        unwatchedMovies: { type: 'number', example: 10 },
        averageRating: { type: 'string', example: '7.8' },
      },
    },
  })
  async getStatistics(@GetUser() user: User) {
    return this.moviesService.getStatistics(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un film spécifique' })
  @ApiParam({ name: 'id', description: 'ID du film (UUID)' })
  @ApiResponse({ status: 200, description: 'Film trouvé' })
  @ApiResponse({ status: 404, description: 'Film non trouvé' })
  @ApiResponse({ status: 403, description: 'Accès interdit (pas votre film)' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.moviesService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un film' })
  @ApiParam({ name: 'id', description: 'ID du film (UUID)' })
  @ApiResponse({ status: 200, description: 'Film modifié avec succès' })
  @ApiResponse({ status: 404, description: 'Film non trouvé' })
  @ApiResponse({ status: 403, description: 'Accès interdit (pas votre film)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMovieDto: UpdateMovieDto,
    @GetUser() user: User,
  ) {
    return this.moviesService.update(id, updateMovieDto, user);
  }

  @Patch(':id/watch')
  @ApiOperation({ summary: 'Marquer un film comme regardé' })
  @ApiParam({ name: 'id', description: 'ID du film (UUID)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        review: { 
          type: 'string', 
          description: 'Avis optionnel sur le film',
          example: 'Excellent film, très divertissant !' 
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Film marqué comme regardé' })
  async markAsWatched(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { review?: string },
    @GetUser() user: User,
  ) {
    return this.moviesService.markAsWatched(id, user, body.review);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un film' })
  @ApiParam({ name: 'id', description: 'ID du film (UUID)' })
  @ApiResponse({ status: 200, description: 'Film supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Film non trouvé' })
  @ApiResponse({ status: 403, description: 'Accès interdit (pas votre film)' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    await this.moviesService.remove(id, user);
    return { message: 'Movie deleted successfully' };
  }

  // Endpoints ADMIN UNIQUEMENT
  @Get('admin/all-users-movies')
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: '[ADMIN] Voir tous les films de tous les utilisateurs',
    description: 'Endpoint réservé aux administrateurs' 
  })
  @ApiResponse({ status: 200, description: 'Tous les films de tous les utilisateurs' })
  @ApiResponse({ status: 403, description: 'Accès interdit (rôle admin requis)' })
  async getAllUsersMovies(@GetUser() user: User) {
    return this.moviesService.findAll(user);
  }

  @Get('admin/global-statistics')
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: '[ADMIN] Statistiques globales',
    description: 'Statistiques de tous les films de tous les utilisateurs' 
  })
  @ApiResponse({ status: 200, description: 'Statistiques globales' })
  @ApiResponse({ status: 403, description: 'Accès interdit (rôle admin requis)' })
  async getGlobalStatistics(@GetUser() user: User) {
    return this.moviesService.getStatistics(user);
  }
}