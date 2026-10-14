import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity.js';
import { TaskComment } from './entities/task-comment.entity.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { NotificationsClient } from '../notifications/notifications.client.js';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskComment)
    private readonly commentRepository: Repository<TaskComment>,
    private readonly notificationsClient: NotificationsClient,
  ) {}

  async findAll(taskId: number, userId: number): Promise<TaskComment[]> {
    await this.findOwnedTask(taskId, userId);

    return this.commentRepository.find({
      where: { taskId },
      order: { createdAt: 'ASC', id: 'ASC' },
    });
  }

  async create(
    taskId: number,
    userId: number,
    dto: CreateCommentDto,
  ): Promise<TaskComment> {
    const task = await this.findOwnedTask(taskId, userId);
    const comment = this.commentRepository.create({
      ...dto,
      taskId,
      userId,
      task,
    });

    const savedComment = await this.commentRepository.save(comment);
    await this.notificationsClient.notifyCommentAdded({
      commentId: savedComment.id,
      taskId,
      recipientId: task.userId,
      message: `New comment: ${dto.body}`,
    });

    return savedComment;
  }

  private async findOwnedTask(taskId: number, userId: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    return task;
  }
}
