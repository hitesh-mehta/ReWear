
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute check:', { 
    user: user?.email, 
    isLoading, 
    requireAdmin, 
    userRole: user?.role,
    currentPath: location.pathname 
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🚫 No user found, redirecting to auth from:', location.pathname);
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (requireAdmin && user.role !== 'admin') {
    console.log('🚫 Admin required but user role is:', user.role, '- redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ Access granted for user:', user.email);
  return <>{children}</>;
};

export default ProtectedRoute;
