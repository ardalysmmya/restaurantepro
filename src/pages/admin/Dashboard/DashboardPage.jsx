import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, Users,
  ShoppingCart, AlertTriangle, Clock, ChefHat,
} from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';
import { ANIMATION_VARIANTS } from '../../../lib/constants';
import { formatCurrency, cn } from '../../../lib/utils';

const kpis = [
  { label: 'Ingresos Hoy', value: '$12,450', change: '+8.2%', icon: DollarSign, up: true },
  { label: 'Órdenes Activas', value: '7', change: '3 en cocina', icon: Clock, up: true },
  { label: 'Comensales Hoy', value: '84', change: '+12%', icon: Users, up: true },
  { label: 'Ticket Promedio', value: '$1,245', change: '-3.1%', icon: ShoppingCart, up: false },
];

const alerts = [
  { type: 'stock', message: 'Salmón Real — stock bajo (3 unidades)', icon: AlertTriangle },
  { type: 'order', message: 'Mesa 12 — excedió 90 min de ocupación', icon: Clock },
  { type: 'kds', message: 'Cocina: 2 órdenes con +15 min de espera', icon: ChefHat },
];

export default function DashboardPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={ANIMATION_VARIANTS.stagger}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">Viernes, 16 Mayo 2026 · Turno Cena</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-sm font-medium">En vivo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, change, icon: Icon, up }, i) => (
          <motion.div
            key={label}
            variants={ANIMATION_VARIANTS.fadeUp}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-5">
              <div className="flex items-start justify-between mb-4">
                <span className="text-white/30 text-xs uppercase tracking-wider">{label}</span>
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Icon size={16} className="text-white/40" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-display font-bold">{value}</span>
                <span className={cn('text-xs font-medium', up ? 'text-green-400' : 'text-red-400')}>
                  {change}
                </span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassCard className="p-6 h-72 flex items-center justify-center text-white/20 text-sm">
            [ Gráfico de Ingresos — Recharts AreaChart ]
          </GlassCard>
        </div>

        <GlassCard className="p-5 space-y-4">
          <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-white/30">
            Alertas
          </h3>
          <div className="space-y-3">
            {alerts.map(({ message, icon: Icon }) => (
              <div
                key={message}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <Icon size={16} className="text-brand-400 shrink-0 mt-0.5" />
                <p className="text-sm text-white/60">{message}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
