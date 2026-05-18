import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { ExternalLink } from 'lucide-react';

const stores = [
  {
    id: 'la-maison',
    name: 'La Maison',
    type: 'Fine Dining',
    color: 'from-brand-400 to-brand-600',
    tables: 16,
    revenue: '$842K',
  },
  {
    id: 'el-asador',
    name: 'El Asador Prime',
    type: 'Steakhouse',
    color: 'from-amber-400 to-red-600',
    tables: 24,
    revenue: '$1.2M',
  },
  {
    id: 'sakura-bar',
    name: 'Sakura Bar',
    type: 'Nikkei Fusion',
    color: 'from-pink-400 to-purple-600',
    tables: 12,
    revenue: '$560K',
  },
  {
    id: 'la-terraza',
    name: 'La Terraza',
    type: 'Mediterráneo',
    color: 'from-emerald-400 to-teal-600',
    tables: 20,
    revenue: '—',
  },
];

export default function StoreSelectorPage() {
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
            <span className="text-gradient-brand">Grupo Gastronómico</span>
          </h1>
          <p className="text-white/40 text-sm">
            Selecciona un restaurante para gestionar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stores.map((store, i) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link
                to={`/store/${store.id}/dashboard`}
                className="glass-card-hover p-6 flex items-center gap-5 group block"
              >
                <div className={cn(
                  'w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center font-display font-bold text-lg shrink-0 shadow-lg',
                  store.color
                )}>
                  {store.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-lg">{store.name}</h3>
                    {store.status !== 'active' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 uppercase tracking-wider">
                        Setup
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 text-sm">{store.type}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-white/30">{store.tables} mesas</span>
                    <span className="text-xs text-brand-400 font-mono">{store.revenue}</span>
                  </div>
                </div>

                <ExternalLink size={16} className="text-white/10 group-hover:text-brand-400 transition-colors shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-white/10 text-xs mt-8">
          Gestión multi-tienda · {stores.filter((s) => s.status === 'active').length} activas
        </p>
      </motion.div>
    </div>
  );
}
