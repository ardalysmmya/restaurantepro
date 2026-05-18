import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChefHat, Plus, Search, Calculator, DollarSign, Package,
  TrendingUp, Trash2, Pencil,
} from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';
import { ANIMATION_VARIANTS, GLASS_STYLE } from '../../../lib/constants';
import { cn, formatCurrency, formatPercent } from '../../../lib/utils';

const mockRecipes = [
  {
    id: '1', dish: 'Hamburguesa Premium', price: 280, category: 'Plato Fuerte',
    ingredients: [
      { name: 'Carne Angus 200g', cost: 55, qty: 200, unit: 'g' },
      { name: 'Pan Brioche', cost: 12, qty: 1, unit: 'pz' },
      { name: 'Queso Cheddar', cost: 8, qty: 40, unit: 'g' },
      { name: 'Vegetales', cost: 6, qty: 60, unit: 'g' },
    ],
  },
  {
    id: '2', dish: 'Salmón Glaseado', price: 520, category: 'Plato Fuerte',
    ingredients: [
      { name: 'Salmón Real 250g', cost: 180, qty: 250, unit: 'g' },
      { name: 'Glaseado Miso', cost: 15, qty: 30, unit: 'ml' },
      { name: 'Espárragos', cost: 22, qty: 100, unit: 'g' },
    ],
  },
  {
    id: '3', dish: 'Risotto de Trufa', price: 480, category: 'Plato Fuerte',
    ingredients: [
      { name: 'Arroz Arborio', cost: 18, qty: 120, unit: 'g' },
      { name: 'Trufa Negra', cost: 95, qty: 10, unit: 'g' },
      { name: 'Parmesano', cost: 25, qty: 40, unit: 'g' },
      { name: 'Mantequilla', cost: 5, qty: 20, unit: 'g' },
    ],
  },
];

mockRecipes.forEach((r) => {
  r.totalCost = r.ingredients.reduce((s, i) => s + i.cost, 0);
  r.margin = ((r.price - r.totalCost) / r.price) * 100;
  r.profit = r.price - r.totalCost;
});

export default function RecipesPage() {
  const [recipes] = useState(mockRecipes);
  const [expandedId, setExpandedId] = useState(null);

  return (
    <motion.div initial="hidden" animate="visible" variants={ANIMATION_VARIANTS.stagger} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Recetas</h1>
          <p className="text-white/40 text-sm mt-1">Bill of Materials (BOM) — costo por platillo</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-sm font-medium rounded-full transition-all">
          <Plus size={16} /> Nueva Receta
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <ChefHat size={20} className="text-brand-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase text-white/30">Recetas</p>
            <p className="text-xl font-bold">{recipes.length}</p>
          </div>
        </GlassCard>
        <GlassCard className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <TrendingUp size={20} className="text-green-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase text-white/30">Margen Promedio</p>
            <p className="text-xl font-bold text-green-400">
              {formatPercent(recipes.reduce((s, r) => s + r.margin, 0) / recipes.length)}
            </p>
          </div>
        </GlassCard>
        <GlassCard className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <DollarSign size={20} className="text-white/40" />
          </div>
          <div>
            <p className="text-[10px] uppercase text-white/30">Ganancia Total</p>
            <p className="text-xl font-bold">{formatCurrency(recipes.reduce((s, r) => s + r.profit, 0))}</p>
          </div>
        </GlassCard>
      </div>

      {/* Recipes List */}
      <div className="space-y-3">
        {recipes.map((recipe) => (
          <GlassCard key={recipe.id} className="overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-white/[0.01] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-500/5 flex items-center justify-center">
                  <ChefHat size={20} className="text-brand-400" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">{recipe.dish}</h3>
                  <p className="text-xs text-white/30">{recipe.category} · {recipe.ingredients.length} ingredientes</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-white/30">Costo</p>
                  <p className="font-mono text-sm">{formatCurrency(recipe.totalCost)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/30">Precio</p>
                  <p className="font-mono text-sm">{formatCurrency(recipe.price)}</p>
                </div>
                <div className={cn('text-right', recipe.margin > 55 ? 'text-green-400' : recipe.margin < 40 ? 'text-red-400' : 'text-brand-400')}>
                  <p className="text-xs text-white/30">Margen</p>
                  <p className="font-mono font-bold text-sm">{formatPercent(recipe.margin)}</p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </button>

            {expandedId === recipe.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-white/5 px-5 pb-5"
              >
                <table className="w-full text-sm mt-4">
                  <thead>
                    <tr>
                      <th className="text-left py-2 text-xs text-white/30 font-medium">Ingrediente</th>
                      <th className="text-right py-2 text-xs text-white/30 font-medium">Cantidad</th>
                      <th className="text-right py-2 text-xs text-white/30 font-medium">Unidad</th>
                      <th className="text-right py-2 text-xs text-white/30 font-medium">Costo Unit.</th>
                      <th className="text-right py-2 text-xs text-white/30 font-medium">Costo Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipe.ingredients.map((ing) => (
                      <tr key={ing.name} className="border-t border-white/[0.02]">
                        <td className="py-2.5 flex items-center gap-2">
                          <Package size={14} className="text-white/10" />
                          {ing.name}
                        </td>
                        <td className="py-2.5 text-right font-mono">{ing.qty}</td>
                        <td className="py-2.5 text-right text-white/40">{ing.unit}</td>
                        <td className="py-2.5 text-right font-mono text-white/40">{formatCurrency(ing.cost)}</td>
                        <td className="py-2.5 text-right font-mono text-brand-400">{formatCurrency(ing.cost)}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-white/10">
                      <td colSpan={3} className="py-3 text-right font-medium text-sm">Costo Total del Platillo</td>
                      <td className="py-3" />
                      <td className="py-3 text-right font-mono font-bold text-brand-400">{formatCurrency(recipe.totalCost)}</td>
                    </tr>
                  </tbody>
                </table>

                <div className={cn(GLASS_STYLE, 'mt-4 p-4 flex items-start gap-3 text-sm text-white/30')}>
                  <Calculator size={18} className="text-brand-400 shrink-0 mt-0.5" />
                  <p>
                    <span className="text-white/50 font-medium">Auto-deducción: </span>
                    Cada venta descuenta automáticamente los ingredientes del inventario. El margen se recalcula en tiempo real cuando los costos de ingredientes cambian.
                  </p>
                </div>
              </motion.div>
            )}
          </GlassCard>
        ))}
      </div>
    </motion.div>
  );
}
