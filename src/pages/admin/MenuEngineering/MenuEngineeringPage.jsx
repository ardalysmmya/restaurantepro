import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown, Calculator } from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';
import { ANIMATION_VARIANTS, GLASS_STYLE } from '../../../lib/constants';
import { cn, formatCurrency, formatPercent } from '../../../lib/utils';
import { recipeService } from '../../../services/recipeService';
import { analyticsService } from '../../../services/analyticsService';

export default function MenuEngineeringPage() {
  const { storeId } = useParams();
  const [recipes, setRecipes] = useState([]);
  const [topDishes, setTopDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [{ data: recipeData }, { data: topData }] = await Promise.all([
          recipeService.getRecipes(storeId),
          analyticsService.getTopDishes(storeId, 10),
        ]);
        const mapped = (recipeData || []).map((r) => {
          const totalCost = (r.ingredients || []).reduce((s, i) => s + (i.qty_per_serv || 0) * (i.ingredient?.cost_per_unit || 0), 0);
          const price = r.dish?.price || 0;
          return { ...r, totalCost, margin: price > 0 ? ((price - totalCost) / price) * 100 : 0, profit: price - totalCost };
        }).sort((a, b) => b.margin - a.margin);
        setRecipes(mapped);
        setTopDishes(topData || []);
      } catch (e) {
        toast.error('Error al cargar datos de ingeniería de menú');
      }
      setLoading(false);
    })();
  }, [storeId]);

  const starDish = recipes[0];
  const lossDish = recipes[recipes.length - 1] || recipes[recipes.length - 2];

  return (
    <motion.div initial="hidden" animate="visible" variants={ANIMATION_VARIANTS.stagger} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Ingeniería de Menú</h1>
          <p className="text-white/40 text-sm mt-1">Análisis de costos, recetas y márgenes</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-white/20">Cargando análisis...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {starDish && (
              <GlassCard className="p-6 border-green-500/20 bg-green-500/[0.02]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <TrendingUp size={20} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/30">Plato Estrella</p>
                    <h3 className="font-display font-semibold">{starDish.dish?.name || '—'}</h3>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Margen', value: formatPercent(starDish.margin), green: true },
                    { label: 'Ganancia/u', value: formatCurrency(starDish.profit) },
                    { label: 'Costo', value: formatCurrency(starDish.totalCost) },
                  ].map(({ label, value, green }) => (
                    <div key={label}>
                      <p className="text-xs text-white/30">{label}</p>
                      <p className={cn('text-2xl font-bold', green && 'text-green-400')}>{value}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
            {lossDish && (
              <GlassCard className="p-6 border-red-500/20 bg-red-500/[0.02]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <TrendingDown size={20} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/30">Menor Margen</p>
                    <h3 className="font-display font-semibold">{lossDish.dish?.name || '—'}</h3>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Margen', value: formatPercent(lossDish.margin), red: true },
                    { label: 'Ganancia/u', value: formatCurrency(lossDish.profit) },
                    { label: 'Costo', value: formatCurrency(lossDish.totalCost) },
                  ].map(({ label, value, red }) => (
                    <div key={label}>
                      <p className="text-xs text-white/30">{label}</p>
                      <p className={cn('text-2xl font-bold', red && 'text-red-400')}>{value}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>

          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-xs uppercase text-white/30">Platillo</th>
                    <th className="text-right p-4 text-xs uppercase text-white/30">Costo</th>
                    <th className="text-right p-4 text-xs uppercase text-white/30">Precio</th>
                    <th className="text-right p-4 text-xs uppercase text-white/30">Margen</th>
                    <th className="text-right p-4 text-xs uppercase text-white/30">Ganancia</th>
                  </tr>
                </thead>
                <tbody>
                  {recipes.map((r) => (
                    <tr key={r.id} className="border-b border-white/[0.02] hover:bg-white/[0.01]">
                      <td className="p-4 font-medium">{r.dish?.name || r.name}</td>
                      <td className="p-4 text-right font-mono">{formatCurrency(r.totalCost)}</td>
                      <td className="p-4 text-right font-mono">{formatCurrency(r.dish?.price || 0)}</td>
                      <td className={cn('p-4 text-right font-mono', r.margin > 55 ? 'text-green-400' : r.margin < 35 ? 'text-red-400' : '')}>
                        {formatPercent(r.margin)}
                      </td>
                      <td className="p-4 text-right font-mono text-brand-400">{formatCurrency(r.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          <div className={cn(GLASS_STYLE, 'p-4 flex items-start gap-3 text-sm text-white/30')}>
            <Calculator size={18} className="text-brand-400 shrink-0 mt-0.5" />
            <p><span className="text-white/50 font-medium">Auto-deducción: </span>Cada venta descuenta ingredientes del inventario automáticamente. El margen se recalcula cuando cambian los costos.</p>
          </div>
        </>
      )}
    </motion.div>
  );
}
