import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Clock, Star, Calendar } from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';
import { ANIMATION_VARIANTS } from '../../../lib/constants';
import { cn, formatCurrency } from '../../../lib/utils';
import { analyticsService } from '../../../services/analyticsService';
import { recipeService } from '../../../services/recipeService';

export default function ReportsPage() {
  const { storeId } = useParams();
  const [revenueData, setRevenueData] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [topDish, setTopDish] = useState(null);
  const [margins, setMargins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [revRes, peakRes, topRes, marginRes] = await Promise.all([
          analyticsService.getRevenueByDay(storeId, 7),
          analyticsService.getPeakHours(storeId),
          analyticsService.getTopDishes(storeId, 1),
          recipeService.getProfitMargins(storeId),
        ]);
        const grouped = {};
        (revRes.data || []).forEach((o) => {
          const day = new Date(o.created_at).toLocaleDateString('es-MX', { weekday: 'short' });
          grouped[day] = (grouped[day] || 0) + (o.total || 0);
        });
        setRevenueData(['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => ({ day: d, revenue: grouped[d] || 0 })));
        setPeakHours(peakRes.data || []);
        setTopDish(topRes.data?.[0] || null);
        setMargins(marginRes.data || []);
      } catch (e) {
        toast.error('Error al cargar reportes');
      }
      setLoading(false);
    })();
  }, [storeId]);

  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue), 1);
  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const activeDays = revenueData.filter((d) => d.revenue > 0).length;
  const avgTicket = activeDays > 0 ? Math.round(totalRevenue / activeDays) : 0;
  const maxPeak = Math.max(...peakHours.map((p) => p.order_count || 0), 1);
  const lossDish = margins.length > 0 ? margins[margins.length - 1] : null;

  return (
    <motion.div initial="hidden" animate="visible" variants={ANIMATION_VARIANTS.stagger} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Reportes & Analíticos</h1>
          <p className="text-white/40 text-sm mt-1">{new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/20">Cargando reportes...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Ingreso Semanal', value: formatCurrency(totalRevenue), icon: DollarSign },
              { label: 'Ticket Promedio', value: formatCurrency(avgTicket), icon: TrendingUp },
              { label: 'Días Activos', value: activeDays, icon: Calendar },
              { label: 'Órdenes Pico', value: maxPeak, icon: Clock },
            ].map(({ label, value, icon: Icon }) => (
              <GlassCard key={label} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wider text-white/30">{label}</span>
                  <Icon size={16} className="text-white/20" />
                </div>
                <p className="text-2xl font-display font-bold">{value}</p>
              </GlassCard>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <h3 className="font-display font-semibold mb-6 flex items-center gap-2">
                <BarChart3 size={18} className="text-brand-400" /> Ingresos por Día
              </h3>
              <div className="flex items-end justify-between gap-2 h-48">
                {revenueData.map(({ day, revenue }) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-white/30 font-mono">{formatCurrency(revenue).replace('.00', '')}</span>
                    <div className="w-full flex-1 flex items-end">
                      <div className="w-full rounded-t-lg bg-gradient-to-t from-brand-500/60 to-brand-400/30" style={{ height: `${(revenue / maxRevenue) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-white/20">{day}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-display font-semibold mb-6 flex items-center gap-2">
                <Clock size={18} className="text-brand-400" /> Horas Pico
              </h3>
              {peakHours.length === 0 ? (
                <p className="text-center text-white/20 py-12">Sin datos aún</p>
              ) : (
                <div className="flex items-end justify-between gap-1 h-48">
                  {peakHours.map(({ hour, order_count }) => (
                    <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex-1 flex items-end">
                        <div className={cn('w-full rounded-t-sm', order_count === maxPeak ? 'bg-gradient-to-t from-brand-500 to-brand-400' : 'bg-gradient-to-t from-white/10 to-white/5')}
                          style={{ height: `${(order_count / maxPeak) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-white/20">{hour}h</span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Star size={20} className="text-brand-400" />
                <div>
                  <p className="text-xs text-white/30">Plato Más Vendido</p>
                  <h4 className="font-display font-semibold">{topDish?.dish_name || '—'}</h4>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-white/30 uppercase">Ventas</p>
                  <p className="text-xl font-bold">{topDish?.total_sold || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase">Ingreso</p>
                  <p className="text-xl font-bold">{formatCurrency(topDish?.total_revenue || 0)}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border-red-500/10">
              <div className="flex items-center gap-3 mb-4">
                <TrendingDown size={20} className="text-red-400" />
                <div>
                  <p className="text-xs text-white/30">Menor Margen</p>
                  <h4 className="font-display font-semibold">{lossDish?.dish_name || '—'}</h4>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-white/30 uppercase">Costo</p>
                  <p className="text-xl font-bold">{formatCurrency(lossDish?.cost || 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase">Margen</p>
                  <p className="text-xl font-bold text-red-400">{lossDish?.margin_pct || 0}%</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </motion.div>
  );
}
