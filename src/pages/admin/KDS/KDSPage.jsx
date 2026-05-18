import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ChefHat, Clock, Flame, CheckCircle2, Timer, Filter } from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';
import { ANIMATION_VARIANTS } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import { orderService } from '../../../services/orderService';
import { useRealtimeOrders } from '../../../hooks/useRealtime';
import { ORDER_STATUS } from '../../../stores/useKDSStore';

const columns = [
  { key: ORDER_STATUS.PENDING, label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  { key: ORDER_STATUS.COOKING, label: 'En Cocina', color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20' },
  { key: ORDER_STATUS.READY, label: 'Listo', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
];

function ElapsedTimer({ startedAt }) {
  const now = Date.now();
  const diff = Math.floor((now - new Date(startedAt).getTime()) / 60000);
  return (
    <span className={cn('text-xs font-mono', diff > 15 ? 'text-red-400' : 'text-white/30')}>
      {diff}m
    </span>
  );
}

export default function KDSPage() {
  const { storeId } = useParams();
  const { orders } = useRealtimeOrders(storeId);
  const [filter, setFilter] = useState('all');

  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const filtered = filter === 'all' ? activeOrders : activeOrders.filter((o) => o.status === filter);

  const handleAdvanceStatus = async (order) => {
    try {
      const next = {
        pending: 'cooking',
        cooking: 'ready',
        ready: 'delivered',
      };
      const newStatus = next[order.status];
      if (newStatus) {
        for (const item of order.items || []) {
          await orderService.updateItemStatus(item.id, newStatus === 'ready' ? 'ready' : newStatus);
        }
        await orderService.updateOrderStatus(order.id, newStatus);
        toast.success(`Orden → ${columns.find((c) => c.key === newStatus)?.label || newStatus}`);
      }
    } catch (e) {
      toast.error('Error al cambiar estado');
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={ANIMATION_VARIANTS.stagger} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChefHat size={28} className="text-brand-400" />
          <div>
            <h1 className="text-2xl font-display font-bold">Kitchen Display</h1>
            <p className="text-white/30 text-sm">{activeOrders.length} órdenes activas</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="glass-card rounded-xl px-4 py-2 text-sm text-white/40 bg-transparent"
          >
            <option value="all">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="cooking">En Cocina</option>
            <option value="ready">Listas</option>
          </select>
          <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-xl text-sm">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400">Live</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(({ key, label, color, bg }) => {
          const colOrders = filtered.filter((o) => o.status === key);
          return (
            <div key={key} className="space-y-3">
              <div className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border', bg, color)}>
                <span className="font-display text-sm font-semibold">{label}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-white/5">{colOrders.length}</span>
              </div>
              <div className="space-y-3">
                {colOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    variants={ANIMATION_VARIANTS.fadeUp}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleAdvanceStatus(order)}
                  >
                    <GlassCard className="p-4 space-y-3 cursor-pointer transition-all duration-300 hover:border-white/20 hover:bg-white/[0.02]">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-white/50">#{order.id?.slice(0, 8)}</span>
                        <ElapsedTimer startedAt={order.started_at || order.created_at} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Flame size={14} className="text-brand-400" />
                          <span className="text-sm font-medium">{order.table?.name || `Mesa ${order.table_id?.slice(0, 4)}`}</span>
                        </div>
                        <ul className="space-y-1">
                          {(order.items || []).map((item) => (
                            <li key={item.id} className="text-sm text-white/60 pl-5 flex justify-between">
                              <span>{item.dish?.name || 'Item'} x{item.quantity}</span>
                              {item.notes && <span className="text-[10px] text-brand-400">{item.notes}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-[10px] text-white/20 uppercase">
                          {order.items?.length || 0} items
                        </span>
                        <button className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
                          <CheckCircle2 size={14} />
                          {key === ORDER_STATUS.PENDING ? 'Iniciar' : key === ORDER_STATUS.COOKING ? 'Listo' : 'Entregar'}
                        </button>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
                {colOrders.length === 0 && (
                  <p className="text-center text-white/10 text-sm py-8">—</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
