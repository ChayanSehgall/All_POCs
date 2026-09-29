import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto/update-task.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: any,
  ) {
    return this.tasksService.create(
      createTaskDto,
      req.user.sub,
    );
  }

  @Get()
  findAll(@Request() req: any) {
    return this.tasksService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.tasksService.findOne(
      Number(id),
      req.user.sub,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any,
  ) {
    return this.tasksService.update(
      Number(id),
      updateTaskDto,
      req.user.sub,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.tasksService.remove(
      Number(id),
      req.user.sub,
    );
  }
}