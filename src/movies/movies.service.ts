import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/roles.enum';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async create(createMovieDto: CreateMovieDto, user: User): Promise<Movie> {
    const movie = this.movieRepository.create({
      ...createMovieDto,
      user: user,
    });

    return this.movieRepository.save(movie);
  }

  async findAll(user: User): Promise<Movie[]> {
    // Si admin, voir tous les films
    if (user.role === Role.ADMIN) {
      return this.movieRepository.find({
        relations: ['user'],
        select: {
          user: {
            id: true,
            email: true,
            name: true,
          },
        },
      });
    }

    // Sinon, voir seulement ses propres films
    return this.movieRepository.find({
      where: { user: { id: user.id } },
      relations: ['user'],
      select: {
        user: {
          id: true,
          email: true,
          name: true,
        },
      },
    });
  }

  async findOne(id: string, user: User): Promise<Movie> {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['user'],
      select: {
        user: {
          id: true,
          email: true,
          name: true,
        },
      },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    // Vérifier la propriété (sauf si admin)
    if (user.role !== Role.ADMIN && movie.user.id !== user.id) {
      throw new ForbiddenException('You can only access your own movies');
    }

    return movie;
  }

  async update(id: string, updateMovieDto: UpdateMovieDto, user: User): Promise<Movie> {
    const movie = await this.findOne(id, user); // Vérifie déjà la propriété

    Object.assign(movie, updateMovieDto);
    return this.movieRepository.save(movie);
  }

  async remove(id: string, user: User): Promise<void> {
    const movie = await this.findOne(id, user); // Vérifie déjà la propriété

    await this.movieRepository.remove(movie);
  }

  async markAsWatched(id: string, user: User, review?: string): Promise<Movie> {
    const movie = await this.findOne(id, user);

    movie.isWatched = true;
    movie.watchedAt = new Date();
    if (review) {
      movie.review = review;
    }

    return this.movieRepository.save(movie);
  }

  async getWatchedMovies(user: User): Promise<Movie[]> {
    const whereCondition = user.role === Role.ADMIN 
      ? { isWatched: true }
      : { isWatched: true, user: { id: user.id } };

    return this.movieRepository.find({
      where: whereCondition,
      relations: ['user'],
      select: {
        user: {
          id: true,
          email: true,
          name: true,
        },
      },
    });
  }

  async getStatistics(user: User) {
    const baseQuery = this.movieRepository.createQueryBuilder('movie');

    if (user.role !== Role.ADMIN) {
      baseQuery.where('movie.userId = :userId', { userId: user.id });
    }

    const [total, watched, avgRating] = await Promise.all([
      baseQuery.getCount(),
      baseQuery.clone().andWhere('movie.isWatched = :isWatched', { isWatched: true }).getCount(),
      baseQuery.clone().andWhere('movie.rating IS NOT NULL').select('AVG(movie.rating)', 'avgRating').getRawOne(),
    ]);

    return {
      totalMovies: total,
      watchedMovies: watched,
      unwatchedMovies: total - watched,
      averageRating: avgRating?.avgRating ? parseFloat(avgRating.avgRating).toFixed(1) : null,
    };
  }
}