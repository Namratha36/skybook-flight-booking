import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ requireAdmin = false }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If email verification is required, but let's make it optional for now or redirect
  if (!currentUser.emailVerified && currentUser.providerData?.[0]?.providerId === 'password') {
    // You could redirect to a 'verify-email' page here
    // return <Navigate to="/verify-email" />;
  }

  if (requireAdmin && currentUser.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}
