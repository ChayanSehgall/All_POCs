import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateNotificationEventDto {
  @IsInt()
  commentId: number;

  @IsInt()
  taskId: number;

  @IsInt()
  recipientId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2200)
  message: string;
}
