import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Search, Plus, Minus, AlertTriangle, TrendingDown,
  Filter, ArrowDown, ArrowUp, History,
} from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';
import { ANIMATION_VARIANTS, GLASS_STYLE } from '../../../lib/constants';
import { cn, formatCurrency } from '../../../lib/utils';

const mockIngredients = [
  { id: '1', name: 'Carne Angus', stock: 12.5, min_stock: 5, unit: 'kg', cost: 275, category: 'Carnes' },
  { id: '2', name: 'Salmón Real', stock: 3.2, min_stock: 4, unit: 'kg', cost: 720, category: 'Pescados' },
  { id: '3', name: 'Trufa Negra', stock: 0.15, min_stock: 0.1, unit: 'kg', cost: 9500, category: 'Gourmet' },
  { id: '4', name: 'Arroz Arborio', stock: 25, min_stock: 10, unit: 'kg', cost: 85, category: 'Granos' },
  { id: '5', name: 'Queso Parmesano', stock: 8, min_stock: 3, unit: 'kg', cost: 420, category: 'Lácteos' },
  { id: '6', name: 'Mantequilla', stock: 4.5, min_stock: 2, unit: 'kg', cost: 120, category: 'Lácteos' },
  { id: '7', name: 'Espárragos', stock: 2, min_stock: 3, unit: 'kg', cost: 180, category: 'Vegetales' },
  { id: '8', name: 'Aguacate', stock: 30, min_stock: 10, unit: 'pz', cost: 25, category: 'Vegetales' },
  { id: '9', name: 'Pan Brioche', stock: 40, min_stock: 20, unit: 'pz', cost: 12, category: 'Panadería' },
  { id: '10', name: 'Chocolate Belga', stock: 5, min_stock: 2, unit: 'kg', cost: 380, category: 'Repostería' },
];

const mockMovements = [
  { id: '1', ingredient: 'Carne Angus', qty: -2.5, type: 'auto', date: '2026-05-18 20:15', ref: 'ORD-042' },
  { id: '2', ingredient: 'Salmón Real', qty: -1.0, type: 'auto', date: '2026-05-18 19:30', ref: 'ORD-041' },
  { id: '3', ingredient: 'Trufa Negra', qty: -0.03, type: 'auto', date: '2026-05-18 18:45', ref: 'ORD-040' },
  { id: '4', ingredient: 'Arroz Arborio', qty: +10, type: 'manual', date: '2026-05-18 10:00', ref: 'Compra' },
  { id: '5', ingredient: 'Pan Brioche', qty: -3, type: 'auto', date: '2026-05-18 20:15', ref: 'ORD-042' },
];

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = mockIngredients.filter((i) => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'low' && i.stock >= i.min_stock) return false;
    if (filter === 'out' && i.stock > 0) return false;
    return true;
  });

  return (
    <motion.div initial="hidden" animate="visible" variants={ANIMATION_VARIANTS.stagger} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Inventario</h1>
          <p className="text-white/40 text-sm mt-1">Control de stock, ingredientes y movimientos</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 glass-card rounded-xl text-sm text-white/40 hover:text-white transition-colors">
            <History size={16} /> Historial
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-sm font-medium rounded-full transition-all">
            <Plus size={16} /> Agregar Ingrediente
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Items', value: '10', icon: Package },
          { label: 'Stock Bajo', value: '2', icon: AlertTriangle, alert: true },
          { label: 'Valor Inventario', value: formatCurrency(45280), icon: TrendingDown },
          { label: 'Movimientos Hoy', value: '5', icon: History },
        ].map(({ label, value, icon: Icon, alert }) => (
          <GlassCard key={label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-white/30">{label}</span>
              <Icon size={14} className={alert ? 'text-yellow-400' : 'text-white/20'} />
            </div>
            <p className={cn('text-xl font-display font-bold', alert ? 'text-yellow-400' : '')}>{value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ingrediente..."
            className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50"
          />
        </div>
        <div className="flex items-center gap-1">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'low', label: 'Stock Bajo' },
            { key: 'out', label: 'Agotados' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs transition-all',
                filter === key ? 'bg-brand-500/10 text-brand-400' : 'text-white/30 hover:text-white/60'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Ingredient List */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-xs uppercase tracking-wider text-white/30">Ingrediente</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-white/30">Categoría</th>
                <th className="text-right p-4 text-xs uppercase tracking-wider text-white/30">Stock</th>
                <th className="text-right p-4 text-xs uppercase tracking-wider text-white/30">Mínimo</th>
                <th className="text-right p-4 text-xs uppercase tracking-wider text-white/30">Costo/u</th>
                <th className="text-right p-4 text-xs uppercase tracking-wider text-white/30">Valor Total</th>
                <th className="text-center p-4 text-xs uppercase tracking-wider text-white/30">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ing) => {
                const low = ing.stock < ing.min_stock;
                const out = ing.stock <= 0;
                return (
                  <tr key={ing.id} className="border-b border-white/[0.02] hover:bg-white/[0.01]">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {low && <AlertTriangle size={14} className="text-yellow-400 shrink-0" />}
                        <span className={cn('font-medium', out && 'text-red-400')}>{ing.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-white/40">{ing.category}</td>
                    <td className={cn('p-4 text-right font-mono', low ? 'text-yellow-400' : '')}>
                      {ing.stock} {ing.unit}
                    </td>
                    <td className="p-4 text-right text-white/20 font-mono">{ing.min_stock} {ing.unit}</td>
                    <td className="p-4 text-right font-mono">{formatCurrency(ing.cost)}</td>
                    <td className="p-4 text-right font-mono text-brand-400">
                      {formatCurrency(ing.stock * ing.cost)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-green-400 transition-colors">
                          <Plus size={14} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-red-400 transition-colors">
                          <Minus size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Recent Movements */}
      <GlassCard className="p-6">
        <h3 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-white/30">
          Movimientos Recientes
        </h3>
        <div className="space-y-2">
          {mockMovements.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  m.qty > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                )}>
                  {m.qty > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                </span>
                <div>
                  <p className="text-sm">{m.ingredient}</p>
                  <p className="text-[10px] text-white/30">{m.ref} · {m.date}</p>
                </div>
              </div>
              <span className={cn('text-sm font-mono', m.qty > 0 ? 'text-green-400' : 'text-red-400')}>
                {m.qty > 0 ? '+' : ''}{m.qty} kg
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}
