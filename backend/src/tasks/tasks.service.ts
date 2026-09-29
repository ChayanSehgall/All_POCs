import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from './entities/task.entity.js';
import { CreateTaskDto } from './dto/create-task.dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto/update-task.dto.js';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(
    createTaskDto: CreateTaskDto,
    userId: number,
  ): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      userId,
    });

    return this.taskRepository.save(task);
  }

  async findAll(userId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: { userId },
    });
  }

  async findOne(id: number, userId: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    userId: number,
  ): Promise<Task> {
    const task = await this.findOne(id, userId);

    Object.assign(task, updateTaskDto);

    return this.taskRepository.save(task);
  }

  async remove(id: number, userId: number): Promise<void> {
    const task = await this.findOne(id, userId);

    await this.taskRepository.remove(task);
  }
}