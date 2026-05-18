import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, Users,
  ShoppingCart, AlertTriangle, Clock, ChefHat,
  Coffee, Package, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '../../../components/ui/GlassCard';
import { ANIMATION_VARIANTS } from '../../../lib/constants';
import { formatCurrency, cn } from '../../../lib/utils';
import { orderService } from '../../../services/orderService';
import { inventoryService } from '../../../services/inventoryService';
import { analyticsService } from '../../../services/analyticsService';
import { useRealtimeOrders } from '../../../hooks/useRealtime';

export default function DashboardPage() {
  const { storeId } = useParams();
  const { orders, loading: ordersLoading } = useRealtimeOrders(storeId);
  const [kpis, setKpis] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const pending = orders.filter((o) => o.status === 'pending').length;
      const cooking = orders.filter((o) => o.status === 'cooking').length;
      const delivered = orders.filter((o) => o.status === 'delivered').length;

      const todayRevenue = orders
        .filter((o) => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.total || 0), 0);

      const avgTicket = delivered > 0 ? todayRevenue / delivered : 0;

      setKpis({
        revenue: todayRevenue,
        ordersActive: pending + cooking,
        ordersDelivered: delivered,
        avgTicket,
        cooking,
        pending,
      });

      const alertList = [];
      if (cooking > 3) alertList.push({ icon: ChefHat, msg: `Cocina: ${cooking} órdenes en proceso` });
      if (pending > 2) alertList.push({ icon: Clock, msg: `${pending} órdenes pendientes sin iniciar` });

      const { data: lowStock } = await inventoryService.getLowStock(storeId);
      if (lowStock?.length > 0) {
        lowStock.forEach((i) => {
          alertList.push({ icon: Package, msg: `Stock bajo: ${i.name} (${i.stock_qty} ${i.unit})` });
        });
      }

      setAlerts(alertList.slice(0, 5));
    } catch (e) {
      toast.error('Error al cargar datos');
    }
  };

  useEffect(() => { loadData(); }, [orders, storeId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Dashboard actualizado');
  };

  const kpiCards = kpis ? [
    { label: 'Ingresos Hoy', value: formatCurrency(kpis.revenue), sub: `${kpis.ordersDelivered} órdenes`, icon: DollarSign, color: 'text-green-400' },
    { label: 'Órdenes Activas', value: kpis.ordersActive, sub: `${kpis.cooking} en cocina · ${kpis.pending} pendientes`, icon: ShoppingCart, color: 'text-brand-400' },
    { label: 'Ticket Promedio', value: formatCurrency(kpis.avgTicket), sub: 'por comanda', icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Completadas', value: kpis.ordersDelivered, sub: 'hoy', icon: Users, color: 'text-green-400' },
  ] : [];

  return (
    <motion.div initial="hidden" animate="visible" variants={ANIMATION_VARIANTS.stagger} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-sm font-medium">En vivo</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 glass-card rounded-xl hover:border-white/20 transition-all"
          >
            <RefreshCw size={16} className={cn('text-white/40', refreshing && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, sub, icon: Icon, color }, i) => (
          <motion.div key={label} variants={ANIMATION_VARIANTS.fadeUp} transition={{ delay: i * 0.1 }}>
            <GlassCard className="p-5">
              <div className="flex items-start justify-between mb-4">
                <span className="text-white/30 text-xs uppercase tracking-wider">{label}</span>
                <Icon size={16} className={color} />
              </div>
              <p className="text-2xl font-display font-bold mb-1">{value}</p>
              <p className="text-xs text-white/30">{sub}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-6">
            <h3 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-white/30">
              Órdenes Activas
            </h3>
            {ordersLoading ? (
              <div className="text-center py-8 text-white/20 text-sm">Cargando...</div>
            ) : orders.filter((o) => o.status !== 'delivered').length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <Coffee size={32} className="text-white/10 mx-auto" />
                <p className="text-white/20 text-sm">No hay órdenes activas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.filter((o) => o.status !== 'delivered').slice(0, 6).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'w-2 h-2 rounded-full',
                        order.status === 'cooking' ? 'bg-brand-400' : 'bg-yellow-400'
                      )} />
                      <div>
                        <p className="text-sm font-medium">
                          {order.table?.name || `Mesa ${order.table_id?.slice(0, 4)}`}
                        </p>
                        <p className="text-[10px] text-white/30">
                          {order.items?.length || 0} items · {order.status === 'cooking' ? 'En cocina' : 'Pendiente'}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-mono text-brand-400">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        <GlassCard className="p-5 space-y-4">
          <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-white/30">Alertas</h3>
          {alerts.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-8">Sin alertas</p>
          ) : (
            <div className="space-y-3">
              {alerts.map(({ msg, icon: Icon }, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <Icon size={16} className="text-brand-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-white/60">{msg}</p>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </motion.div>
  );
}
