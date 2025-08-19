import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure body parser with larger limits for image uploads
  app.use(require('express').json({ limit: '50mb' }));
  app.use(require('express').urlencoded({ limit: '50mb', extended: true }));

  app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // <-- très important pour les query params ! sinn query params arrivent comme string ?minPrice=100 => "100" . 
      whitelist: true, // retire les propriétés inconnues
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
