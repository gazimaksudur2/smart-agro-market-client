import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SellerRoute({ children }) {
  const { currentUser, loading, isSeller } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentUser || !isSeller()) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return children;
} 