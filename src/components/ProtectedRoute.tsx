import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import authService from '../services/authService';
import { useAuthModal } from '../context/AuthModalContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'admin' | 'moderator';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user } = useAppSelector((s) => s.auth);
  const { openLogin } = useAuthModal();

  // If not logged in, open the login modal then redirect back to home
  useEffect(() => {
    if (!user) openLogin();
  }, [user, openLogin]);

  if (!user) {
    // Stay on current page while modal opens (no hard redirect to /login)
    return <Navigate to="/" replace />;
  }

  if (role === 'admin' && !authService.isAdmin()) {
    return <Navigate to="/" replace />;
  }

  if (role === 'moderator' && !authService.isModerator()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
