import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    // Redirect to login if not authenticated
    window.location.href = '/login';
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
