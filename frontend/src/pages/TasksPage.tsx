import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  deleteTask,
  getTasks,
  type Task,
} from '../api/api';

import TaskForm from '../components/TaskForm';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(
    null,
  );
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  async function loadTasks() {
    try {
      setError('');

      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load tasks';

      setError(message);

      if (
        message.toLowerCase().includes('authentication') ||
        message.toLowerCase().includes('unauthorized')
      ) {
        logout();
      }
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task?',
    );

    if (!confirmed) return;

    try {
      await deleteTask(id);
      await loadTasks();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete task',
      );
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  function handleSaved() {
    setShowForm(false);
    setEditingTask(null);
    loadTasks();
  }

  const user = JSON.parse(
    localStorage.getItem('user') || '{}',
  );

  return (
    <div className="tasks-page">
      <header className="top-bar">
        <div>
          <h1>Task Tracker</h1>
          <p>Logged in as {user.email}</p>
        </div>

        <button onClick={logout}>Logout</button>
      </header>

      <main>
        <div className="tasks-header">
          <h2>My Tasks</h2>

          <button
            onClick={() => {
              setEditingTask(null);
              setShowForm(true);
            }}
          >
            + New Task
          </button>
        </div>

        {showForm && (
          <TaskForm
            task={editingTask}
            onSaved={handleSaved}
            onCancel={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
          />
        )}

        {error && <p className="error">{error}</p>}

        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks yet.</p>
            <p>Create your first task!</p>
          </div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <div className="task-card" key={task.id}>
                <div>
                  <h3>{task.title}</h3>

                  {task.description && (
                    <p>{task.description}</p>
                  )}

                  <span className={`status ${task.status}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="task-actions">
                  <button
                    onClick={() => {
                      setEditingTask(task);
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}