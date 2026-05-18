import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Chrome } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import GlassCard from '../../components/ui/GlassCard';
import { signUpWithEmail } from '../../lib/supabase';

export default function RegisterPage() {
  const { user, loginWithGoogle, error } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/?app=admin" replace />;

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);
    try {
      await signUpWithEmail(email, password, name);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen noise-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">
            <span className="text-gradient-brand">Crear</span>
            <span className="text-gradient"> Cuenta</span>
          </h1>
          <p className="text-white/40 text-sm">Comienza a gestionar tu restaurante</p>
        </div>

        <GlassCard className="p-8 space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs text-white/30 uppercase tracking-wider mb-1.5 block">Nombre</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 transition-colors"
                  placeholder="Tu nombre completo"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/30 uppercase tracking-wider mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 transition-colors"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/30 uppercase tracking-wider mb-1.5 block">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 transition-colors"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {(localError || error) && (
              <p className="text-red-400 text-xs bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                {localError || error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-[0_0_24px_rgba(238,122,18,0.3)]"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-xs text-white/20 bg-premium-dark">o continúa con</span>
            </div>
          </div>

          <button
            onClick={loginWithGoogle}
            className="w-full py-3.5 glass-card-hover !rounded-xl text-white/70 hover:text-white font-medium text-sm flex items-center justify-center gap-3 transition-all"
          >
            <Chrome size={18} />
            Google
          </button>

          <p className="text-center text-white/20 text-xs">
            ¿Ya tienes cuenta?{' '}
            <Link to="/auth/login" className="text-brand-400 hover:text-brand-300 transition-colors">
              Iniciar Sesión
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
