import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign,
  Users, Clock, Star, Calendar,
} from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';
import { ANIMATION_VARIANTS } from '../../../lib/constants';
import { cn, formatCurrency } from '../../../lib/utils';

const peakHours = [
  { hour: '12', value: 15 }, { hour: '1', value: 28 }, { hour: '2', value: 42 },
  { hour: '3', value: 35 }, { hour: '4', value: 8 }, { hour: '5', value: 5 },
  { hour: '6', value: 10 }, { hour: '7', value: 32 }, { hour: '8', value: 55 },
  { hour: '9', value: 48 }, { hour: '10', value: 30 }, { hour: '11', value: 12 },
];
const maxValue = Math.max(...peakHours.map((d) => d.value));

const weekDays = [
  { day: 'Lun', revenue: 45000 }, { day: 'Mar', revenue: 42000 }, { day: 'Mie', revenue: 48000 },
  { day: 'Jue', revenue: 62000 }, { day: 'Vie', revenue: 85000 }, { day: 'Sab', revenue: 92000 },
  { day: 'Dom', revenue: 48000 },
];
const maxRevenue = Math.max(...weekDays.map((d) => d.revenue));

export default function ReportsPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={ANIMATION_VARIANTS.stagger}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Reportes & Analíticos</h1>
          <p className="text-white/40 text-sm mt-1">Mayo 2026 · Ingresos del mes: $842,000</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 glass-card rounded-xl text-sm text-white/40 hover:text-white transition-colors flex items-center gap-2">
            <Calendar size={14} /> Este Mes
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Ingreso Total', value: '$842K', change: '+12.5%', icon: DollarSign, up: true },
          { label: 'Comensales', value: '1,240', change: '+8.3%', icon: Users, up: true },
          { label: 'Ticket Promedio', value: '$679', change: '+3.8%', icon: TrendingUp, up: true },
          { label: 'Cancelaciones', value: '4.2%', change: '-2.1%', icon: TrendingDown, up: true },
        ].map(({ label, value, change, icon: Icon, up }) => (
          <GlassCard key={label} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider text-white/30">{label}</span>
              <Icon size={16} className="text-white/20" />
            </div>
            <p className="text-2xl font-display font-bold mb-1">{value}</p>
            <span className={cn('text-xs', up ? 'text-green-400' : 'text-red-400')}>
              {change} vs. mes anterior
            </span>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by day */}
        <GlassCard className="p-6">
          <h3 className="font-display font-semibold mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-brand-400" />
            Ingresos por Día
          </h3>
          <div className="flex items-end justify-between gap-2 h-48">
            {weekDays.map(({ day, revenue }) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-white/30 font-mono">
                  {formatCurrency(revenue).replace('.00', '')}
                </span>
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-brand-500/60 to-brand-400/30 transition-all duration-700"
                    style={{ height: `${(revenue / maxRevenue) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-white/20">{day}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Peak hours */}
        <GlassCard className="p-6">
          <h3 className="font-display font-semibold mb-6 flex items-center gap-2">
            <Clock size={18} className="text-brand-400" />
            Horas Pico (Órdenes por hora)
          </h3>
          <div className="flex items-end justify-between gap-1 h-48">
            {peakHours.map(({ hour, value }) => (
              <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={cn(
                      'w-full rounded-t-sm transition-all duration-700',
                      value === maxValue
                        ? 'bg-gradient-to-t from-brand-500 to-brand-400'
                        : 'bg-gradient-to-t from-white/10 to-white/5'
                    )}
                    style={{ height: `${(value / maxValue) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-white/20">{hour}h</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-brand-500 to-brand-400" />
              <span className="text-white/30">Hora pico (8 PM)</span>
            </div>
            <span className="text-white/50 font-medium">55 órdenes</span>
          </div>
        </GlassCard>
      </div>

      {/* Star Dish vs Loss Dish (mini version for reports) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Star size={20} className="text-brand-400" />
            <div>
              <p className="text-xs text-white/30">Plato Más Vendido</p>
              <h4 className="font-display font-semibold">Tartar de Atún</h4>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] text-white/30 uppercase">Ventas</p>
              <p className="text-xl font-bold">340</p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase">Ingreso</p>
              <p className="text-xl font-bold">{formatCurrency(108800)}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase">Margen</p>
              <p className="text-xl font-bold text-green-400">62%</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border-red-500/10">
          <div className="flex items-center gap-3 mb-4">
            <TrendingDown size={20} className="text-red-400" />
            <div>
              <p className="text-xs text-white/30">Plato con Mayor Pérdida</p>
              <h4 className="font-display font-semibold">Risotto de Trufa</h4>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] text-white/30 uppercase">Ventas</p>
              <p className="text-xl font-bold">180</p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase">Costo/u</p>
              <p className="text-xl font-bold">{formatCurrency(143)}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase">Margen</p>
              <p className="text-xl font-bold text-red-400">30%</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
