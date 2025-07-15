import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  genre: string;

  @Column({ nullable: true })
  director: string;

  @Column({ nullable: true })
  releaseYear: number;

  @Column({ nullable: true })
  rating: number;

  @Column({ default: false })
  isWatched: boolean;

  @Column({ nullable: true })
  watchedAt: Date;

  @Column({ nullable: true })
  review: string;

  @ManyToOne(() => User, (user) => user.movies)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}