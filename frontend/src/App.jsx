import { Navigate, Route, Routes } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import TasksPage from './pages/TasksPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={<Navigate to="/tasks" replace />}
      />

      <Route
        path="*"
        element={<Navigate to="/tasks" replace />}
      />
    </Routes>
  );
}

export default App;