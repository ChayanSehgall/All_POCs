import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationEventDto } from './dto/create-notification-event.dto.js';
import { NotificationEvent } from './entities/notification-event.entity.js';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEvent)
    private readonly eventRepository: Repository<NotificationEvent>,
  ) {}

  async record(
    event: CreateNotificationEventDto,
  ): Promise<NotificationEvent> {
    await this.eventRepository.upsert(event, ['commentId']);
    return this.eventRepository.findOneByOrFail({
      commentId: event.commentId,
    });
  }
}
