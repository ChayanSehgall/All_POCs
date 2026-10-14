import { useEffect, useState, type FormEvent } from 'react';
import {
  createTaskComment,
  getTaskComments,
  type TaskComment,
} from '../api/api';

export default function TaskComments({ taskId }: { taskId: number }) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  async function loadComments() {
    try {
      setComments(await getTaskComments(taskId));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    }
  }

  useEffect(() => {
    void loadComments();
  }, [taskId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createTaskComment(taskId, body);
      setBody('');
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    }
  }

  return (
    <section className="task-comments" aria-label="Task comments">
      <h4>Comments</h4>
      {comments.map((comment) => (
        <p key={comment.id}>
          {comment.body}
          <small> {new Date(comment.createdAt).toLocaleString()}</small>
        </p>
      ))}
      <form onSubmit={handleSubmit}>
        <input
          aria-label="Add a comment"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={2000}
          placeholder="Add a comment"
          required
        />
        <button type="submit">Comment</button>
      </form>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
