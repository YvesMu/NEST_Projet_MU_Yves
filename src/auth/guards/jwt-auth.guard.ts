// filepath: c:\Users\Shin_\Downloads\NEST_Projet\movie-watchlist\src\auth\guards\jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}