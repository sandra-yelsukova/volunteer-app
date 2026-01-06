import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute() {
  const { auth, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!auth?.token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
