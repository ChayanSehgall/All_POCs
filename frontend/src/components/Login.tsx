import { useState } from 'react';
import { login } from '../api/api';

interface LoginProps {
  onLogin: () => void;
  onSwitchToRegister: () => void;
}

export default function Login({
  onLogin,
  onSwitchToRegister,
}: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);

      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      onLogin();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Login failed',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h1>Task Tracker</h1>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p>
        Don't have an account?{' '}
        <button
          type="button"
          className="link-button"
          onClick={onSwitchToRegister}
        >
          Register
        </button>
      </p>
    </div>
  );
}