import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationEvent } from './entities/notification-event.entity.js';
import { NotificationsService } from './notifications.service.js';

describe('NotificationsService', () => {
  let service: NotificationsService;
  const eventRepository = {
    upsert: vi.fn(),
    findOneByOrFail: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(NotificationEvent),
          useValue: eventRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('records each comment event idempotently', async () => {
    const event = {
      commentId: 11,
      taskId: 3,
      recipientId: 7,
      message: 'New comment: Ready',
    };
    eventRepository.findOneByOrFail.mockResolvedValue(event);

    await expect(service.record(event)).resolves.toEqual(event);

    expect(eventRepository.upsert).toHaveBeenCalledWith(event, ['commentId']);
    expect(eventRepository.findOneByOrFail).toHaveBeenCalledWith({
      commentId: 11,
    });
  });
});
