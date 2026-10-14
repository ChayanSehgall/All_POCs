const API_URL =
  (import.meta as ImportMeta & { env: { VITE_API_URL?: string } }).env
    .VITE_API_URL || 'http://localhost:3000';

export interface User {
  id: number;
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface TaskComment {
  id: number;
  body: string;
  createdAt: string;
  taskId: number;
  userId: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: Task['status'];
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'Something went wrong',
    );
  }

  return data;
}

export async function register(
  email: string,
  password: string,
) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

function authHeaders() {
  const token = localStorage.getItem('token');

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getTasks(): Promise<Task[]> {
  return request<Task[]>('/tasks', {
    headers: authHeaders(),
  });
}

export async function createTask(
  task: CreateTaskData,
): Promise<Task> {
  return request<Task>('/tasks', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(task),
  });
}

export async function updateTask(
  id: number,
  task: Partial<CreateTaskData>,
): Promise<Task> {
  return request<Task>(`/tasks/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(task),
  });
}

export async function deleteTask(id: number): Promise<void> {
  await request(`/tasks/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export async function getTaskComments(taskId: number): Promise<TaskComment[]> {
  return request<TaskComment[]>(`/tasks/${taskId}/comments`, {
    headers: authHeaders(),
  });
}

export async function createTaskComment(
  taskId: number,
  body: string,
): Promise<TaskComment> {
  return request<TaskComment>(`/tasks/${taskId}/comments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ body }),
  });
}