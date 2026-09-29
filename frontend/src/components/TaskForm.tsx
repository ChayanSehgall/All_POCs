import { useState } from 'react';
import {
  createTask,
  updateTask,
  type Task,
} from '../api/api';

interface TaskFormProps {
  task?: Task | null;
  onSaved: () => void;
  onCancel?: () => void;
}

export default function TaskForm({
  task,
  onSaved,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(
    task?.description ?? '',
  );
  const [status, setStatus] = useState<Task['status']>(
    task?.status ?? 'TODO',
  );

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const editing = Boolean(task);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      if (editing && task) {
        await updateTask(task.id, {
          title,
          description,
          status,
        });
      } else {
        await createTask({
          title,
          description,
          status,
        });
      }

      onSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save task',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>{editing ? 'Edit Task' : 'Create Task'}</h2>

      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
      />

      <select
        value={status}
        onChange={(e) =>
          setStatus(e.target.value as Task['status'])
        }
      >
        <option value="TODO">TODO</option>
        <option value="IN_PROGRESS">IN PROGRESS</option>
        <option value="DONE">DONE</option>
      </select>

      {error && <p className="error">{error}</p>}

      <div className="form-buttons">
        <button type="submit" disabled={loading}>
          {loading
            ? 'Saving...'
            : editing
              ? 'Update Task'
              : 'Create Task'}
        </button>

        {editing && onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}