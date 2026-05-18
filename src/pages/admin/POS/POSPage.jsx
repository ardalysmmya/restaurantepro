import { useState } from 'react';
import { motion } from 'framer-motion';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import {
  Circle, Coffee, Users, Clock, Plus, Minus, Trash2,
} from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';
import { ANIMATION_VARIANTS } from '../../../lib/constants';
import { cn, formatCurrency } from '../../../lib/utils';
import { TABLE_STATUS } from '../../../stores/usePOSStore';

const menuItems = [
  { name: 'Tartar de Atún', price: 320, category: 'Entradas' },
  { name: 'Risotto de Trufa', price: 480, category: 'Plato Fuerte' },
  { name: 'Salmón Glaseado', price: 520, category: 'Plato Fuerte' },
  { name: 'Cordero Confitado', price: 650, category: 'Plato Fuerte' },
  { name: 'Soufflé de Chocolate', price: 280, category: 'Postres' },
  { name: 'Vino Tinto Casa', price: 180, category: 'Bebidas' },
];

const statusConfig = {
  [TABLE_STATUS.FREE]: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Libre' },
  [TABLE_STATUS.OCCUPIED]: { color: 'bg-brand-500/20 text-brand-400 border-brand-500/30', label: 'Ocupada' },
  [TABLE_STATUS.RESERVED]: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Reservada' },
  [TABLE_STATUS.DIRTY]: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Sucia' },
};

export default function POSPage() {
  const [activeTable, setActiveTable] = useState(null);
  const [activeOrders, setActiveOrders] = useState({
    M1: { items: [{ id: '1', name: 'Tartar de Atún', price: 320, quantity: 2 }], status: 'occupied' },
    M3: { items: [{ id: '2', name: 'Risotto de Trufa', price: 480, quantity: 1 }], status: 'occupied' },
  });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const tables = Array.from({ length: 12 }, (_, i) => {
    const id = `M${i + 1}`;
    const order = activeOrders[id];
    return {
      id,
      name: `Mesa ${i + 1}`,
      seats: [2, 2, 4, 4, 6, 2, 4, 8, 2, 4, 6, 4][i],
      status: order ? TABLE_STATUS.OCCUPIED : i === 4 ? TABLE_STATUS.RESERVED : TABLE_STATUS.FREE,
    };
  });

  const addItem = (tableId, item) => {
    setActiveOrders((prev) => {
      const current = prev[tableId] || { items: [], status: 'occupied' };
      const existing = current.items.find((i) => i.name === item.name);
      if (existing) {
        return {
          ...prev,
          [tableId]: {
            ...current,
            items: current.items.map((i) =>
              i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
            ),
          },
        };
      }
      return {
        ...prev,
        [tableId]: {
          ...current,
          items: [...current.items, { ...item, id: crypto.randomUUID?.() || Date.now(), quantity: 1 }],
        },
      };
    });
  };

  const removeItem = (tableId, itemId) => {
    setActiveOrders((prev) => {
      const current = prev[tableId];
      if (!current) return prev;
      const newItems = current.items.filter((i) => i.id !== itemId);
      if (newItems.length === 0) {
        const { [tableId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [tableId]: { ...current, items: newItems } };
    });
  };

  const selectedOrder = activeTable ? activeOrders[activeTable] : null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={ANIMATION_VARIANTS.stagger}
      className="h-full flex gap-6"
    >
      {/* Table Map */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">Punto de Venta</h1>
          <div className="flex items-center gap-4 text-xs">
            {Object.entries(statusConfig).map(([key, { color }]) => (
              <span key={key} className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${color}`}>
                <Circle size={6} className="fill-current" /> {statusConfig[key].label}
              </span>
            ))}
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter}>
          <SortableContext items={tables.map((t) => t.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {tables.map((table) => {
                const order = activeOrders[table.id];
                const total = order?.items.reduce((s, i) => s + i.price * i.quantity, 0) || 0;

                return (
                  <button
                    key={table.id}
                    onClick={() => setActiveTable(table.id)}
                    className={cn(
                      'glass-card p-4 text-center transition-all duration-300 hover:border-white/20',
                      activeTable === table.id && 'border-brand-500/50 bg-brand-500/5'
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">{table.name}</span>
                      <Users size={14} className="text-white/20" />
                    </div>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {Array.from({ length: Math.min(table.seats, 4) }, (_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'w-3 h-3 rounded-full',
                            order && i < Math.min(order.items.length, 4)
                              ? 'bg-brand-500'
                              : 'bg-white/10'
                          )}
                        />
                      ))}
                    </div>
                    {order && (
                      <span className="text-xs font-mono text-brand-400">
                        {formatCurrency(total)}
                      </span>
                    )}
                    {!order && (
                      <span className={`text-[10px] uppercase tracking-wider font-medium ${statusConfig[table.status].color}`}>
                        {statusConfig[table.status].label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Order Panel */}
      {selectedOrder ? (
        <GlassCard className="w-80 shrink-0 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">{activeTable && `Mesa ${activeTable.replace('M', '')}`}</h3>
            <Clock size={16} className="text-white/30" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            {selectedOrder.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03]">
                <div>
                  <p className="text-sm">{item.name}</p>
                  <p className="text-xs text-white/30">{formatCurrency(item.price)} c/u</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">x{item.quantity}</span>
                  <span className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  <button
                    onClick={() => removeItem(activeTable, item.id)}
                    className="p-1 hover:text-red-400 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-3 border-t border-white/5">
            <h4 className="text-xs uppercase tracking-wider text-white/30 mb-2">Agregar al pedido</h4>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => addItem(activeTable, item)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                >
                  <span className="text-sm">{item.name}</span>
                  <span className="text-xs text-white/30">{formatCurrency(item.price)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 mt-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-white/40">Total</span>
              <span className="text-xl font-display font-bold text-brand-400">
                {formatCurrency(selectedOrder.items.reduce((s, i) => s + i.price * i.quantity, 0))}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm transition-colors">
                Enviar KDS
              </button>
              <button className="py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-sm font-medium transition-colors">
                Cobrar
              </button>
            </div>
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="w-80 shrink-0 p-6 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Coffee size={32} className="text-white/10 mx-auto" />
            <p className="text-sm text-white/20">
              Selecciona una mesa para iniciar una orden
            </p>
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
