import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Clock, Flame, CheckCircle2, Filter, Timer } from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';
import { ANIMATION_VARIANTS } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import { ORDER_STATUS, PRIORITY } from '../../../stores/useKDSStore';

const columns = [
  { key: ORDER_STATUS.PENDING, label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  { key: ORDER_STATUS.COOKING, label: 'En Cocina', color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20' },
  { key: ORDER_STATUS.READY, label: 'Listo', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
];

const priorityConfig = {
  [PRIORITY.NORMAL]: { label: 'Normal', color: 'text-white/30' },
  [PRIORITY.HIGH]: { label: 'Alta', color: 'text-brand-400' },
  [PRIORITY.RUSH]: { label: 'Urgente', color: 'text-red-400', pulse: true },
};

const mockOrders = [
  {
    id: 'ORD-042',
    table: 'Mesa 3',
    items: ['Risotto de Trufa x1', 'Tartar de Atún x2', 'Soufflé Choc x1'],
    status: ORDER_STATUS.PENDING,
    priority: PRIORITY.HIGH,
    elapsed: '4m',
  },
  {
    id: 'ORD-041',
    table: 'Mesa 7',
    items: ['Salmón Glaseado x2', 'Vieiras Parrilla x1'],
    status: ORDER_STATUS.COOKING,
    priority: PRIORITY.NORMAL,
    elapsed: '12m',
  },
  {
    id: 'ORD-040',
    table: 'Mesa 1',
    items: ['Cordero Confitado x2', 'Crème Brûlée x2'],
    status: ORDER_STATUS.COOKING,
    priority: PRIORITY.RUSH,
    elapsed: '22m',
  },
  {
    id: 'ORD-039',
    table: 'Mesa 5',
    items: ['Tartar de Atún x1', 'Vino Tinto x2'],
    status: ORDER_STATUS.READY,
    priority: PRIORITY.NORMAL,
    elapsed: '18m',
  },
  {
    id: 'ORD-038',
    table: 'Mesa 2',
    items: ['Menú Degustación x4'],
    status: ORDER_STATUS.PENDING,
    priority: PRIORITY.NORMAL,
    elapsed: '2m',
  },
];

export default function KDSPage() {
  const [orders, setOrders] = useState(mockOrders);

  const advanceOrder = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const statuses = [ORDER_STATUS.PENDING, ORDER_STATUS.COOKING, ORDER_STATUS.READY];
        const idx = statuses.indexOf(o.status);
        if (idx < statuses.length - 1) return { ...o, status: statuses[idx + 1] };
        return { ...o, status: ORDER_STATUS.DELIVERED };
      }).filter((o) => o.status !== ORDER_STATUS.DELIVERED)
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={ANIMATION_VARIANTS.stagger}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChefHat size={28} className="text-brand-400" />
          <div>
            <h1 className="text-2xl font-display font-bold">Kitchen Display</h1>
            <p className="text-white/30 text-sm">{orders.length} órdenes activas</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 glass-card rounded-xl text-sm text-white/40 hover:text-white transition-colors">
            <Filter size={16} /> Filtrar
          </button>
          <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-xl text-sm">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400">Live</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(({ key, label, color, bg }) => (
          <div key={key} className="space-y-3">
            <div className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border', bg, color)}>
              <span className="font-display text-sm font-semibold">{label}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-white/5">
                {orders.filter((o) => o.status === key).length}
              </span>
            </div>

            <div className="space-y-3">
              {orders
                .filter((o) => o.status === key)
                .sort((a, b) => b.priority - a.priority)
                .map((order, i) => {
                  const priority = priorityConfig[order.priority];
                  const isOverdue = order.elapsed > '15m' && order.status !== ORDER_STATUS.READY;

                  return (
                    <motion.div
                      key={order.id}
                      variants={ANIMATION_VARIANTS.fadeUp}
                      transition={{ delay: i * 0.05 }}
                    >
                      <GlassCard
                        className={cn(
                          'p-4 space-y-3 cursor-pointer transition-all duration-300 hover:border-white/20',
                          isOverdue && 'border-red-500/30 bg-red-500/[0.02]'
                        )}
                        onClick={() => advanceOrder(order.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-white/50">{order.id}</span>
                          <div className="flex items-center gap-2">
                            {priority.pulse && (
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                              </span>
                            )}
                            <span className={cn('text-[10px] uppercase tracking-wider font-semibold', priority.color)}>
                              {priority.label}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Flame size={14} className="text-brand-400" />
                            <span className="text-sm font-medium">{order.table}</span>
                          </div>
                          <ul className="space-y-1">
                            {order.items.map((item) => (
                              <li key={item} className="text-sm text-white/60 pl-5">{item}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <div className="flex items-center gap-1.5 text-xs text-white/30">
                            <Timer size={12} />
                            <span className={cn(isOverdue && 'text-red-400')}>{order.elapsed}</span>
                          </div>
                          <button className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors">
                            <CheckCircle2 size={14} />
                            {key === ORDER_STATUS.PENDING
                              ? 'Iniciar'
                              : key === ORDER_STATUS.COOKING
                                ? 'Listo'
                                : 'Entregar'}
                          </button>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
