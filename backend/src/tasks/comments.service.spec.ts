import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationsClient } from '../notifications/notifications.client.js';
import { Task } from './entities/task.entity.js';
import { TaskComment } from './entities/task-comment.entity.js';
import { CommentsService } from './comments.service.js';

describe('CommentsService', () => {
  let service: CommentsService;
  const taskRepository = { findOne: vi.fn() };
  const commentRepository = {
    create: vi.fn(),
    find: vi.fn(),
    save: vi.fn(),
  };
  const notificationsClient = { notifyCommentAdded: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getRepositoryToken(Task), useValue: taskRepository },
        {
          provide: getRepositoryToken(TaskComment),
          useValue: commentRepository,
        },
        { provide: NotificationsClient, useValue: notificationsClient },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  it('creates a comment for an owned task and notifies its owner', async () => {
    taskRepository.findOne.mockResolvedValue({
      id: 3,
      title: 'Prepare demo',
      userId: 7,
    });
    commentRepository.create.mockImplementation((value) => value);
    commentRepository.save.mockResolvedValue({
      id: 11,
      body: 'Ready',
      taskId: 3,
      userId: 7,
    });
    notificationsClient.notifyCommentAdded.mockResolvedValue(undefined);

    const result = await service.create(3, 7, { body: 'Ready' });

    expect(result.id).toBe(11);
    expect(notificationsClient.notifyCommentAdded).toHaveBeenCalledWith({
      commentId: 11,
      taskId: 3,
      recipientId: 7,
      message: 'New comment: Ready',
    });
  });

  it('does not expose comments on another user’s task', async () => {
    taskRepository.findOne.mockResolvedValue(null);

    await expect(service.findAll(3, 99)).rejects.toThrow(
      'Task with ID 3 not found',
    );
    expect(commentRepository.find).not.toHaveBeenCalled();
  });
});
