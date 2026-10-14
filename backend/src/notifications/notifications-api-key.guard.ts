import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';

@Injectable()
export class NotificationsApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const configuredKey = process.env.NOTIFICATIONS_API_KEY;
    if (!configuredKey) {
      throw new InternalServerErrorException(
        'Notifications API key is not configured',
      );
    }

    const providedKey = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined> }>()
      .headers['x-notifications-api-key'];
    if (!providedKey) {
      throw new UnauthorizedException('Notifications API key required');
    }

    const expected = Buffer.from(configuredKey);
    const received = Buffer.from(providedKey);
    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    ) {
      throw new UnauthorizedException('Invalid notifications API key');
    }

    return true;
  }
}
