import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator, TrendingUp, TrendingDown, DollarSign,
  Plus, Trash2, Beef, Wheat, Fish,
} from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';
import { ANIMATION_VARIANTS, GLASS_STYLE } from '../../../lib/constants';
import { cn, formatCurrency, formatPercent } from '../../../lib/utils';

const ingredientIcons = { Beef, Wheat, Fish };

const mockRecipes = [
  {
    id: '1', dish: 'Hamburguesa Premium', price: 280, category: 'Plato Fuerte',
    ingredients: [
      { name: 'Carne Angus 200g', cost: 55, qty: 200, unit: 'g' },
      { name: 'Pan Brioche', cost: 12, qty: 1, unit: 'pz' },
      { name: 'Queso Cheddar', cost: 8, qty: 40, unit: 'g' },
      { name: 'Vegetales', cost: 6, qty: 60, unit: 'g' },
    ],
    sales: 340,
    margin: null,
  },
  {
    id: '2', dish: 'Salmón Glaseado', price: 520, category: 'Plato Fuerte',
    ingredients: [
      { name: 'Salmón Real 250g', cost: 180, qty: 250, unit: 'g' },
      { name: 'Glaseado Miso', cost: 15, qty: 30, unit: 'ml' },
      { name: 'Espárragos', cost: 22, qty: 100, unit: 'g' },
    ],
    sales: 210,
    margin: null,
  },
  {
    id: '3', dish: 'Risotto de Trufa', price: 480, category: 'Plato Fuerte',
    ingredients: [
      { name: 'Arroz Arborio', cost: 18, qty: 120, unit: 'g' },
      { name: 'Trufa Negra', cost: 95, qty: 10, unit: 'g' },
      { name: 'Parmesano', cost: 25, qty: 40, unit: 'g' },
      { name: 'Mantequilla', cost: 5, qty: 20, unit: 'g' },
    ],
    sales: 180,
    margin: null,
  },
  {
    id: '4', dish: 'Poke Bowl', price: 260, category: 'Entradas',
    ingredients: [
      { name: 'Atún Fresco', cost: 65, qty: 150, unit: 'g' },
      { name: 'Arroz Sushi', cost: 10, qty: 120, unit: 'g' },
      { name: 'Aguacate', cost: 15, qty: 60, unit: 'g' },
    ],
    sales: 500,
    margin: null,
  },
];

mockRecipes.forEach((r) => {
  const totalCost = r.ingredients.reduce((s, i) => s + i.cost, 0);
  r.margin = ((r.price - totalCost) / r.price) * 100;
  r.totalCost = totalCost;
  r.profit = r.price - totalCost;
});

const sorted = [...mockRecipes].sort((a, b) => b.margin - a.margin);
const starDish = sorted[0];
const lossDish = sorted[sorted.length - 2];

export default function MenuEngineeringPage() {
  const [recipes] = useState(mockRecipes);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={ANIMATION_VARIANTS.stagger}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Ingeniería de Menú</h1>
          <p className="text-white/40 text-sm mt-1">
            Análisis de costos, recetas y márgenes de ganancia
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-sm font-medium rounded-full transition-all">
          <Plus size={16} /> Nueva Receta
        </button>
      </div>

      {/* Star vs Loss */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-6 border-green-500/20 bg-green-500/[0.02]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-white/30">Plato Estrella</p>
              <h3 className="font-display font-semibold">{starDish.dish}</h3>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-white/30">Margen</p>
              <p className="text-2xl font-bold text-green-400">{formatPercent(starDish.margin)}</p>
            </div>
            <div>
              <p className="text-xs text-white/30">Ganancia/u</p>
              <p className="text-2xl font-bold">{formatCurrency(starDish.profit)}</p>
            </div>
            <div>
              <p className="text-xs text-white/30">Ventas</p>
              <p className="text-2xl font-bold">{starDish.sales}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border-red-500/20 bg-red-500/[0.02]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <TrendingDown size={20} className="text-red-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-white/30">Menor Margen</p>
              <h3 className="font-display font-semibold">{lossDish.dish}</h3>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-white/30">Margen</p>
              <p className="text-2xl font-bold text-red-400">{formatPercent(lossDish.margin)}</p>
            </div>
            <div>
              <p className="text-xs text-white/30">Ganancia/u</p>
              <p className="text-2xl font-bold">{formatCurrency(lossDish.profit)}</p>
            </div>
            <div>
              <p className="text-xs text-white/30">Ventas</p>
              <p className="text-2xl font-bold">{lossDish.sales}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recipe Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-xs uppercase tracking-wider text-white/30 font-medium">Platillo</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-white/30 font-medium">Categoría</th>
                <th className="text-right p-4 text-xs uppercase tracking-wider text-white/30 font-medium">Costo</th>
                <th className="text-right p-4 text-xs uppercase tracking-wider text-white/30 font-medium">Precio</th>
                <th className="text-right p-4 text-xs uppercase tracking-wider text-white/30 font-medium">Margen</th>
                <th className="text-right p-4 text-xs uppercase tracking-wider text-white/30 font-medium">Ganancia/u</th>
                <th className="text-center p-4 text-xs uppercase tracking-wider text-white/30 font-medium">Ventas</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((r) => (
                <tr key={r.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                  <td className="p-4">
                    <span className="font-medium">{r.dish}</span>
                    <div className="flex gap-1 mt-1">
                      {r.ingredients.map((ing) => (
                        <span
                          key={ing.name}
                          className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-white/30"
                          title={ing.name}
                        >
                          {ing.name.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-white/40">{r.category}</td>
                  <td className="p-4 text-right font-mono">{formatCurrency(r.totalCost)}</td>
                  <td className="p-4 text-right font-mono">{formatCurrency(r.price)}</td>
                  <td className={cn('p-4 text-right font-mono', r.margin > 55 ? 'text-green-400' : r.margin < 40 ? 'text-red-400' : '')}>
                    {formatPercent(r.margin)}
                  </td>
                  <td className="p-4 text-right font-mono text-brand-400">{formatCurrency(r.profit)}</td>
                  <td className="p-4 text-center font-mono">{r.sales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Auto-deduction explanation */}
      <div className={cn(GLASS_STYLE, 'p-4 flex items-start gap-3 text-sm text-white/30')}>
        <Calculator size={18} className="text-brand-400 shrink-0 mt-0.5" />
        <p>
          <span className="text-white/50 font-medium">Descuento automático de inventario: </span>
          Cada venta de "Hamburguesa Premium" descuenta 200g de carne Angus, 1 pan brioche, 40g de queso y 60g de vegetales del inventario. El sistema recalcula márgenes en tiempo real.
        </p>
      </div>
    </motion.div>
  );
}
