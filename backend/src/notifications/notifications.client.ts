import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CreateNotificationEventDto } from './dto/create-notification-event.dto.js';

@Injectable()
export class NotificationsClient {
  async notifyCommentAdded(event: CreateNotificationEventDto): Promise<void> {
    const baseUrl = process.env.NOTIFICATIONS_URL;
    const apiKey = process.env.NOTIFICATIONS_API_KEY;
    if (!baseUrl || !apiKey) {
      throw new ServiceUnavailableException(
        'Notifications service is not configured; the comment was saved',
      );
    }

    const response = await fetch(`${baseUrl}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-notifications-api-key': apiKey,
      },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Notifications service returned ${response.status}; the comment was saved`,
      );
    }
  }
}
