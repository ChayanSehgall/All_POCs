import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { Task } from './entities/task.entity.js';
import { TaskComment } from './entities/task-comment.entity.js';
import { CommentsController } from './comments.controller.js';
import { CommentsService } from './comments.service.js';
import { NotificationsClientModule } from '../notifications/notifications-client.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskComment]),
    AuthModule,
    NotificationsClientModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
