import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Store } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useAuthStore } from '../../../stores/useAuthStore';

const COLORS = [
  'from-brand-400 to-brand-600', 'from-amber-400 to-red-600',
  'from-pink-400 to-purple-600', 'from-emerald-400 to-teal-600',
  'from-cyan-400 to-blue-600', 'from-violet-400 to-indigo-600',
];

export default function StoreSelectorPage() {
  const { restaurants, loading } = useAuthStore();

  return (
    <div className="min-h-screen noise-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold mb-3">
            <span className="text-gradient-brand">Mis Restaurantes</span>
          </h1>
          <p className="text-white/40 text-sm">
            {loading ? 'Cargando...' : `${restaurants.length} restaurantes`}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Store size={48} className="text-white/10 mx-auto" />
            <p className="text-white/30">No tienes restaurantes aún.</p>
            <p className="text-white/10 text-sm">Crea tu primer restaurante desde Supabase.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurants.map((store, i) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link
                  to={`/store/${store.slug || store.id}/dashboard`}
                  className="glass-card-hover p-6 flex items-center gap-5 group block"
                >
                  <div className={cn(
                    'w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center font-display font-bold text-lg shrink-0 shadow-lg',
                    COLORS[i % COLORS.length]
                  )}>
                    {(store.name || store.slug || '??').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold text-lg">{store.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 uppercase">
                        {store.plan || 'starter'}
                      </span>
                    </div>
                    <p className="text-white/40 text-sm">{store.address || 'Sin dirección'}</p>
                  </div>
                  <ExternalLink size={16} className="text-white/10 group-hover:text-brand-400 transition-colors shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
