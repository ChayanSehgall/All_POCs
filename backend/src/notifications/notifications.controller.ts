import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateNotificationEventDto } from './dto/create-notification-event.dto.js';
import { NotificationsApiKeyGuard } from './notifications-api-key.guard.js';
import { NotificationsService } from './notifications.service.js';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Post('notifications')
  @UseGuards(NotificationsApiKeyGuard)
  record(@Body() event: CreateNotificationEventDto) {
    return this.notificationsService.record(event);
  }
}
