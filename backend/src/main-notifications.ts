import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NotificationsAppModule } from './notifications/notifications-app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsAppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(Number(process.env.PORT || 3001), '0.0.0.0');
}

bootstrap();
