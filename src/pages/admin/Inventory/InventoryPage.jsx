import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Package, Search, Plus, Minus, AlertTriangle,
  ArrowDown, ArrowUp, History, X, Save,
} from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';
import { ANIMATION_VARIANTS } from '../../../lib/constants';
import { cn, formatCurrency } from '../../../lib/utils';
import { inventoryService } from '../../../services/inventoryService';

export default function InventoryPage() {
  const { storeId } = useParams();
  const [ingredients, setIngredients] = useState([]);
  const [movements, setMovements] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [newIngredient, setNewIngredient] = useState({ name: '', unit: 'g', cost_per_unit: 0, stock_qty: 0, min_stock: 5 });
  const [adjustQty, setAdjustQty] = useState(0);

  useEffect(() => { loadData(); }, [storeId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [{ data: ing }, { data: mov }] = await Promise.all([
        inventoryService.getIngredients(storeId),
        inventoryService.getMovements(storeId),
      ]);
      setIngredients(ing || []);
      setMovements(mov || []);
    } catch (e) {
      toast.error('Error al cargar inventario');
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    try {
      await inventoryService.upsertIngredient({ ...newIngredient, restaurant_id: storeId });
      toast.success('Ingrediente creado');
      setShowNew(false);
      setNewIngredient({ name: '', unit: 'g', cost_per_unit: 0, stock_qty: 0, min_stock: 5 });
      loadData();
    } catch (e) { toast.error('Error'); }
  };

  const handleAdjust = async (ingredientId, qty) => {
    try {
      await inventoryService.adjustStock(storeId, ingredientId, qty, 'Ajuste manual');
      toast.success(`Stock ${qty > 0 ? 'agregado' : 'descontado'}`);
      setEditingStock(null);
      loadData();
    } catch (e) { toast.error('Error'); }
  };

  const getValue = (qty, cost) => (qty || 0) * (cost || 0);

  const filtered = ingredients.filter((i) => {
    if (search && !i.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'low') return (i.stock_qty || 0) < (i.min_stock || 5);
    if (filter === 'out') return (i.stock_qty || 0) <= 0;
    return true;
  });

  const totalValue = ingredients.reduce((sum, i) => sum + getValue(i.stock_qty, i.cost_per_unit), 0);
  const lowCount = ingredients.filter((i) => (i.stock_qty || 0) < (i.min_stock || 5)).length;

  return (
    <motion.div initial="hidden" animate="visible" variants={ANIMATION_VARIANTS.stagger} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Inventario</h1>
          <p className="text-white/40 text-sm mt-1">{ingredients.length} ingredientes</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-sm font-medium rounded-full transition-all"
        >
          <Plus size={16} /> Nuevo
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Items', value: ingredients.length, icon: Package },
          { label: 'Stock Bajo', value: lowCount, icon: AlertTriangle, alert: lowCount > 0 },
          { label: 'Valor Total', value: formatCurrency(totalValue), icon: ArrowDown },
          { label: 'Movimientos', value: movements.length, icon: History },
        ].map(({ label, value, icon: Icon, alert }) => (
          <GlassCard key={label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-white/30">{label}</span>
              <Icon size={14} className={alert ? 'text-yellow-400' : 'text-white/20'} />
            </div>
            <p className={cn('text-xl font-display font-bold', alert && 'text-yellow-400')}>{value}</p>
          </GlassCard>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50" />
        </div>
        {['all', 'low', 'out'].map((k) => (
          <button key={k} onClick={() => setFilter(k)} className={cn('px-3 py-1.5 rounded-lg text-xs transition-all', filter === k ? 'bg-brand-500/10 text-brand-400' : 'text-white/30 hover:text-white/60')}>
            {k === 'all' ? 'Todos' : k === 'low' ? 'Stock Bajo' : 'Agotados'}
          </button>
        ))}
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-xs uppercase text-white/30">Ingrediente</th>
                <th className="text-right p-4 text-xs uppercase text-white/30">Stock</th>
                <th className="text-right p-4 text-xs uppercase text-white/30">Mínimo</th>
                <th className="text-right p-4 text-xs uppercase text-white/30">Costo/u</th>
                <th className="text-right p-4 text-xs uppercase text-white/30">Valor</th>
                <th className="text-center p-4 text-xs uppercase text-white/30">Ajuste</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ing) => {
                const low = (ing.stock_qty || 0) < (ing.min_stock || 5);
                return (
                  <tr key={ing.id} className="border-b border-white/[0.02] hover:bg-white/[0.01]">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {low && <AlertTriangle size={14} className="text-yellow-400 shrink-0" />}
                        <span className={cn('font-medium', (ing.stock_qty || 0) <= 0 && 'text-red-400')}>{ing.name}</span>
                      </div>
                    </td>
                    <td className={cn('p-4 text-right font-mono', low ? 'text-yellow-400' : '')}>{ing.stock_qty} {ing.unit}</td>
                    <td className="p-4 text-right text-white/20 font-mono">{ing.min_stock}</td>
                    <td className="p-4 text-right font-mono">{formatCurrency(ing.cost_per_unit)}</td>
                    <td className="p-4 text-right font-mono text-brand-400">{formatCurrency(getValue(ing.stock_qty, ing.cost_per_unit))}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleAdjust(ing.id, 1)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-green-400"><Plus size={14} /></button>
                        <button onClick={() => handleAdjust(ing.id, -1)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-red-400"><Minus size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-white/30">Movimientos Recientes</h3>
        <div className="space-y-2">
          {movements.slice(0, 8).map((m) => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center', m.qty_change > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>
                  {m.qty_change > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                </span>
                <div>
                  <p className="text-sm">{m.ingredient?.name || '—'}</p>
                  <p className="text-[10px] text-white/30">{m.notes || m.type} · {new Date(m.created_at).toLocaleString('es-MX')}</p>
                </div>
              </div>
              <span className={cn('text-sm font-mono', m.qty_change > 0 ? 'text-green-400' : 'text-red-400')}>
                {m.qty_change > 0 ? '+' : ''}{m.qty_change} {m.ingredient?.unit || ''}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowNew(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-card p-6 w-96" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold">Nuevo Ingrediente</h3>
                <button onClick={() => setShowNew(false)} className="p-1 text-white/30 hover:text-white"><X size={16} /></button>
              </div>
              <div className="space-y-3">
                <input value={newIngredient.name} onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })} placeholder="Nombre" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={newIngredient.unit} onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })} placeholder="Unidad (g, kg, pz)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
                  <input type="number" value={newIngredient.cost_per_unit} onChange={(e) => setNewIngredient({ ...newIngredient, cost_per_unit: +e.target.value })} placeholder="Costo por unidad" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" value={newIngredient.stock_qty} onChange={(e) => setNewIngredient({ ...newIngredient, stock_qty: +e.target.value })} placeholder="Stock inicial" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
                  <input type="number" value={newIngredient.min_stock} onChange={(e) => setNewIngredient({ ...newIngredient, min_stock: +e.target.value })} placeholder="Stock mínimo" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
                </div>
                <button onClick={handleCreate} disabled={!newIngredient.name} className="w-full py-2.5 bg-brand-500 hover:bg-brand-400 disabled:opacity-30 rounded-xl text-sm font-medium">Guardar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
