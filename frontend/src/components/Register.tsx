import { useState } from 'react';
import { register } from '../api/api';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export default function Register({
  onSwitchToLogin,
}: RegisterProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await register(email, password);

      setSuccess('Registration successful. You can now log in.');

      setEmail('');
      setPassword('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Registration failed',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h1>Task Tracker</h1>
      <h2>Create Account</h2>

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
          placeholder="Password (minimum 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Register'}
        </button>
      </form>

      <p>
        Already have an account?{' '}
        <button
          type="button"
          className="link-button"
          onClick={onSwitchToLogin}
        >
          Login
        </button>
      </p>
    </div>
  );
}