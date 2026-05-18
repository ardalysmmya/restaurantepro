import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ChefHat, Plus, Search, Calculator, Package,
  TrendingUp, Trash2, Pencil, X, Save, ChevronDown, ChevronUp, DollarSign,
} from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';
import { ANIMATION_VARIANTS } from '../../../lib/constants';
import { cn, formatCurrency, formatPercent } from '../../../lib/utils';
import { recipeService } from '../../../services/recipeService';
import { inventoryService } from '../../../services/inventoryService';
import { menuService } from '../../../services/menuService';

export default function RecipesPage() {
  const { storeId } = useParams();
  const [recipes, setRecipes] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newRecipe, setNewRecipe] = useState({ dish_id: '', name: '' });
  const [addingIngredient, setAddingIngredient] = useState({ recipeId: null, ingredient_id: '', qty_per_serv: 0 });

  useEffect(() => { loadData(); }, [storeId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [{ data: r }, { data: d }, { data: i }] = await Promise.all([
        recipeService.getRecipes(storeId),
        menuService.getDishes(storeId),
        inventoryService.getIngredients(storeId),
      ]);
      setRecipes((r || []).map((rec) => {
        const totalCost = (rec.ingredients || []).reduce((s, ing) => s + (ing.qty_per_serv || 0) * (ing.ingredient?.cost_per_unit || 0), 0);
        return { ...rec, totalCost, margin: rec.dish?.price ? ((rec.dish.price - totalCost) / rec.dish.price) * 100 : 0, profit: (rec.dish?.price || 0) - totalCost };
      }));
      setDishes(d || []);
      setIngredients(i || []);
    } catch (e) {
      toast.error('Error al cargar recetas');
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    try {
      await recipeService.upsertRecipe({ ...newRecipe, restaurant_id: storeId });
      toast.success('Receta creada');
      setShowNew(false);
      setNewRecipe({ dish_id: '', name: '' });
      loadData();
    } catch (e) { toast.error('Error'); }
  };

  const handleAddIngredient = async (recipeId) => {
    try {
      await recipeService.addIngredient({ ...addingIngredient, recipe_id: recipeId });
      toast.success('Ingrediente agregado');
      setAddingIngredient({ recipeId: null, ingredient_id: '', qty_per_serv: 0 });
      loadData();
    } catch (e) { toast.error('Error'); }
  };

  const handleRemoveIngredient = async (id) => {
    try {
      await recipeService.removeIngredient(id);
      toast.success('Ingrediente removido');
      loadData();
    } catch (e) { toast.error('Error'); }
  };

  const avgMargin = recipes.length > 0 ? recipes.reduce((s, r) => s + r.margin, 0) / recipes.length : 0;

  return (
    <motion.div initial="hidden" animate="visible" variants={ANIMATION_VARIANTS.stagger} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Recetas</h1>
          <p className="text-white/40 text-sm mt-1">Bill of Materials — costo por platillo</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-sm font-medium rounded-full transition-all">
          <Plus size={16} /> Nueva Receta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Recetas', value: recipes.length, icon: ChefHat },
          { label: 'Margen Promedio', value: formatPercent(avgMargin), icon: TrendingUp, color: avgMargin > 50 ? 'text-green-400' : 'text-yellow-400' },
          { label: 'Ganancia Total/u', value: formatCurrency(recipes.reduce((s, r) => s + r.profit, 0)), icon: DollarSign },
        ].map(({ label, value, icon: Icon, color }) => (
          <GlassCard key={label} className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <Icon size={20} className="text-brand-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-white/30">{label}</p>
              <p className={cn('text-xl font-bold', color)}>{value}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-white/20">Cargando recetas...</div>
      ) : (
        <div className="space-y-3">
          {recipes.map((recipe) => (
            <GlassCard key={recipe.id} className="overflow-hidden">
              <button onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-white/[0.01]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-500/5 flex items-center justify-center">
                    <ChefHat size={20} className="text-brand-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">{recipe.dish?.name || recipe.name}</h3>
                    <p className="text-xs text-white/30">{(recipe.ingredients || []).length} ingredientes</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right"><p className="text-xs text-white/30">Costo</p><p className="font-mono text-sm">{formatCurrency(recipe.totalCost)}</p></div>
                  <div className="text-right"><p className="text-xs text-white/30">Precio</p><p className="font-mono text-sm">{formatCurrency(recipe.dish?.price || 0)}</p></div>
                  <div className={cn('text-right', recipe.margin > 50 ? 'text-green-400' : recipe.margin < 30 ? 'text-red-400' : 'text-brand-400')}>
                    <p className="text-xs text-white/30">Margen</p><p className="font-mono font-bold text-sm">{formatPercent(recipe.margin)}</p>
                  </div>
                  {expandedId === recipe.id ? <ChevronUp size={16} className="text-white/20" /> : <ChevronDown size={16} className="text-white/20" />}
                </div>
              </button>

              <AnimatePresence>
                {expandedId === recipe.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/5 px-5 pb-5">
                    <table className="w-full text-sm mt-4">
                      <thead>
                        <tr>
                          <th className="text-left py-2 text-xs text-white/30">Ingrediente</th>
                          <th className="text-right py-2 text-xs text-white/30">Cantidad</th>
                          <th className="text-right py-2 text-xs text-white/30">Costo/u</th>
                          <th className="text-right py-2 text-xs text-white/30">Costo Total</th>
                          <th className="text-center py-2 text-xs text-white/30"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(recipe.ingredients || []).map((ri) => (
                          <tr key={ri.id} className="border-t border-white/[0.02]">
                            <td className="py-2.5 flex items-center gap-2"><Package size={14} className="text-white/10" />{ri.ingredient?.name}</td>
                            <td className="py-2.5 text-right font-mono">{ri.qty_per_serv} {ri.ingredient?.unit}</td>
                            <td className="py-2.5 text-right font-mono text-white/40">{formatCurrency(ri.ingredient?.cost_per_unit || 0)}</td>
                            <td className="py-2.5 text-right font-mono text-brand-400">{formatCurrency((ri.qty_per_serv || 0) * (ri.ingredient?.cost_per_unit || 0))}</td>
                            <td className="py-2.5 text-center">
                              <button onClick={() => handleRemoveIngredient(ri.id)} className="p-1 text-white/20 hover:text-red-400"><Trash2 size={14} /></button>
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t border-white/10">
                          <td colSpan={2} className="py-3 text-right font-medium text-sm">Costo Total</td>
                          <td /><td className="py-3 text-right font-mono font-bold text-brand-400">{formatCurrency(recipe.totalCost)}</td><td />
                        </tr>
                      </tbody>
                    </table>

                    <div className="mt-4 flex items-end gap-3">
                      <div className="flex-1">
                        <select
                          value={addingIngredient.ingredient_id}
                          onChange={(e) => setAddingIngredient({ ...addingIngredient, ingredient_id: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                        >
                          <option value="">+ Agregar ingrediente...</option>
                          {ingredients.map((i) => (
                            <option key={i.id} value={i.id}>{i.name} ({formatCurrency(i.cost_per_unit)}/{i.unit})</option>
                          ))}
                        </select>
                      </div>
                      <input type="number" placeholder="Cant" value={addingIngredient.qty_per_serv || ''}
                        onChange={(e) => setAddingIngredient({ ...addingIngredient, qty_per_serv: +e.target.value })}
                        className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white" />
                      <button
                        onClick={() => handleAddIngredient(recipe.id)}
                        disabled={!addingIngredient.ingredient_id || !addingIngredient.qty_per_serv}
                        className="px-4 py-2.5 bg-brand-500 hover:bg-brand-400 disabled:opacity-30 rounded-xl text-sm font-medium transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          ))}
          {recipes.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <ChefHat size={32} className="text-white/10 mx-auto" />
              <p className="text-white/20 text-sm">No hay recetas. Crea una para empezar a calcular costos.</p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowNew(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-card p-6 w-96" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold">Nueva Receta</h3>
                <button onClick={() => setShowNew(false)} className="p-1 text-white/30 hover:text-white"><X size={16} /></button>
              </div>
              <div className="space-y-3">
                <select value={newRecipe.dish_id} onChange={(e) => setNewRecipe({ ...newRecipe, dish_id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white">
                  <option value="">Seleccionar platillo...</option>
                  {dishes.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <button onClick={handleCreate} disabled={!newRecipe.dish_id}
                  className="w-full py-2.5 bg-brand-500 hover:bg-brand-400 disabled:opacity-30 rounded-xl text-sm font-medium">Crear Receta</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
