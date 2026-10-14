import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notification_events')
export class NotificationEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  commentId: number;

  @Column()
  taskId: number;

  @Column()
  recipientId: number;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}
