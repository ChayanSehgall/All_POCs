import { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  function handleLogin() {
    navigate('/tasks');
  }

  if (showRegister) {
    return (
      <Register
        onSwitchToLogin={() => setShowRegister(false)}
      />
    );
  }

  return (
    <Login
      onLogin={handleLogin}
      onSwitchToRegister={() => setShowRegister(true)}
    />
  );
}