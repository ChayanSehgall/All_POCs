import { Module } from '@nestjs/common';
import { NotificationsClient } from './notifications.client.js';

@Module({
  providers: [NotificationsClient],
  exports: [NotificationsClient],
})
export class NotificationsClientModule {}
