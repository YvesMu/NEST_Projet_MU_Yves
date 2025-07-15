import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation globale
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Movie Watchlist API')
    .setDescription('API pour gérer votre liste de films avec authentification sécurisée')
    .setVersion('1.0')
    .addTag('auth', 'Authentification et inscription')
    .addTag('movies', 'Gestion des films')
    .addTag('users', 'Gestion des utilisateurs')
    .addTag('email', 'Tests d\'emails')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log('🚀 Application démarrée sur http://localhost:3000');
  console.log('📖 Documentation Swagger disponible sur http://localhost:3000/api');
}
bootstrap();
