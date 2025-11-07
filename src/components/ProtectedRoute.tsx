import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('learner' | 'educator' | 'institution')[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard if user doesn't have permission
        if (userRole === 'learner') {
          navigate('/dashboard');
        } else if (userRole === 'educator') {
          navigate('/admin');
        } else {
          navigate('/institution');
        }
      }
    }
  }, [user, userRole, loading, allowedRoles, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
