import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEvent } from './entities/notification-event.entity.js';
import { NotificationsApiKeyGuard } from './notifications-api-key.guard.js';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USERNAME || 'taskuser',
      password: process.env.DB_PASSWORD || 'taskpassword',
      database: process.env.DB_NAME || 'tasktracker',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([NotificationEvent]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsApiKeyGuard],
})
export class NotificationsAppModule {}
