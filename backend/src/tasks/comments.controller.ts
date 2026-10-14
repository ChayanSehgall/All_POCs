import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { CommentsService } from './comments.service.js';

@Controller('tasks/:taskId/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findAll(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Request() request: { user: { sub: number } },
  ) {
    return this.commentsService.findAll(taskId, request.user.sub);
  }

  @Post()
  create(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: CreateCommentDto,
    @Request() request: { user: { sub: number } },
  ) {
    return this.commentsService.create(taskId, request.user.sub, dto);
  }
}
