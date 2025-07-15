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
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Role } from '../common/enums/roles.enum';
import { User } from '../users/entities/user.entity';

@Controller('movies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  async create(@Body() createMovieDto: CreateMovieDto, @GetUser() user: User) {
    return this.moviesService.create(createMovieDto, user);
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return this.moviesService.findAll(user);
  }

  @Get('watched')
  async getWatchedMovies(@GetUser() user: User) {
    return this.moviesService.getWatchedMovies(user);
  }

  @Get('statistics')
  async getStatistics(@GetUser() user: User) {
    return this.moviesService.getStatistics(user);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.moviesService.findOne(id, user);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMovieDto: UpdateMovieDto,
    @GetUser() user: User,
  ) {
    return this.moviesService.update(id, updateMovieDto, user);
  }

  @Patch(':id/watch')
  async markAsWatched(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { review?: string },
    @GetUser() user: User,
  ) {
    return this.moviesService.markAsWatched(id, user, body.review);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    await this.moviesService.remove(id, user);
    return { message: 'Movie deleted successfully' };
  }

  // Endpoint ADMIN ONLY - Voir tous les films de tous les utilisateurs
  @Get('admin/all-users-movies')
  @Roles(Role.ADMIN)
  async getAllUsersMovies(@GetUser() user: User) {
    return this.moviesService.findAll(user);
  }

  // Endpoint ADMIN ONLY - Statistiques globales
  @Get('admin/global-statistics')
  @Roles(Role.ADMIN)
  async getGlobalStatistics(@GetUser() user: User) {
    return this.moviesService.getStatistics(user);
  }
}