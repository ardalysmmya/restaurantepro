import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useEffect } from 'react';

export default function AuthGuard({ children }) {
  const { user, loading, init } = useAuthStore();

  useEffect(() => { init(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-premium-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/30 text-sm">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth/login" replace />;
  return children;
}
