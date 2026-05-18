import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Circle, Coffee, Users, Clock, Plus, Minus, Trash2,
  Check, Printer, CreditCard, Split, Send, X,
} from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';
import { ANIMATION_VARIANTS } from '../../../lib/constants';
import { formatCurrency, cn } from '../../../lib/utils';
import { orderService } from '../../../services/orderService';
import { menuService } from '../../../services/menuService';
import { useRealtimeOrders, useRealtimeTables } from '../../../hooks/useRealtime';
import { TABLE_STATUS } from '../../../stores/usePOSStore';

const statusConfig = {
  [TABLE_STATUS.FREE]: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Libre' },
  [TABLE_STATUS.OCCUPIED]: { color: 'bg-brand-500/20 text-brand-400 border-brand-500/30', label: 'Ocupada' },
  [TABLE_STATUS.RESERVED]: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Reservada' },
  [TABLE_STATUS.DIRTY]: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Sucia' },
};

export default function POSPage() {
  const { storeId } = useParams();
  const { tables } = useRealtimeTables(storeId);
  const { orders } = useRealtimeOrders(storeId);
  const [dishes, setDishes] = useState([]);
  const [activeTableId, setActiveTableId] = useState(null);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitCount, setSplitCount] = useState(2);

  useEffect(() => {
    menuService.getDishes(storeId).then(({ data }) => setDishes(data || []));
  }, [storeId]);

  const activeTable = tables.find((t) => t.id === activeTableId);
  const activeOrder = orders.find((o) => o.table_id === activeTableId && o.status !== 'delivered');
  const activeItems = activeOrder?.items || [];

  const handleSelectTable = (tableId) => {
    setActiveTableId(activeTableId === tableId ? null : tableId);
  };

  const handleCreateOrder = async () => {
    try {
      await orderService.createOrder({
        restaurant_id: storeId,
        table_id: activeTableId,
        status: 'pending',
      });
      await orderService.updateTableStatus(activeTableId, 'occupied');
      toast.success('Orden creada');
    } catch (e) {
      toast.error('Error al crear orden');
    }
  };

  const handleAddItem = async (dish) => {
    if (!activeOrder) {
      await handleCreateOrder();
      setTimeout(() => addItemToOrder(dish), 500);
      return;
    }
    addItemToOrder(dish);
  };

  const addItemToOrder = async (dish) => {
    try {
      const existing = activeItems.find((i) => i.dish_id === dish.id);
      if (existing) {
        toast.info(`${dish.name} ya está en la orden`);
        return;
      }
      await orderService.addItemToOrder({
        order_id: activeOrder.id,
        dish_id: dish.id,
        quantity: 1,
        unit_price: dish.price,
      });
      toast.success(`${dish.name} agregado`);
    } catch (e) {
      toast.error('Error al agregar');
    }
  };

  const handleUpdateQty = async (itemId, delta) => {
    const item = activeItems.find((i) => i.id === itemId);
    const newQty = (item?.quantity || 0) + delta;
    try {
      if (newQty <= 0) {
        await orderService.removeItemFromOrder(itemId);
        toast.success('Item eliminado');
      } else {
        await orderService.addItemToOrder({
          ...item,
          quantity: newQty,
          order_id: activeOrder.id,
        });
        toast.success('Cantidad actualizada');
      }
    } catch (e) {
      toast.error('Error');
    }
  };

  const handleSendToKitchen = async () => {
    try {
      for (const item of activeItems) {
        await orderService.updateItemStatus(item.id, 'pending');
      }
      await orderService.updateOrderStatus(activeOrder.id, 'pending');
      toast.success('Enviado a cocina');
    } catch (e) {
      toast.error('Error al enviar');
    }
  };

  const handlePayment = async () => {
    try {
      await orderService.updateOrderStatus(activeOrder.id, 'delivered', {
        completed_at: new Date().toISOString(),
      });
      await orderService.updateTableStatus(activeTableId, 'dirty');
      setActiveTableId(null);
      toast.success('Cobro exitoso');
    } catch (e) {
      toast.error('Error al procesar pago');
    }
  };

  const handleSplitBill = () => {
    setShowSplitModal(true);
  };

  const total = activeItems.reduce((sum, i) => sum + (i.unit_price || 0) * (i.quantity || 0), 0);
  const splitAmount = splitCount > 0 ? total / splitCount : 0;

  return (
    <motion.div initial="hidden" animate="visible" variants={ANIMATION_VARIANTS.stagger} className="h-full flex gap-6">
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

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {tables.map((table) => {
            const order = orders.find((o) => o.table_id === table.id && o.status !== 'delivered');
            const tableTotal = order?.items?.reduce((s, i) => s + (i.unit_price || 0) * (i.quantity || 0), 0) || 0;
            const isActive = activeTableId === table.id;

            return (
              <button
                key={table.id}
                onClick={() => handleSelectTable(table.id)}
                className={cn(
                  'glass-card p-4 text-center transition-all duration-300 hover:border-white/20',
                  isActive && 'border-brand-500/50 bg-brand-500/5'
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">{table.name}</span>
                  <Users size={14} className="text-white/20" />
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {Array.from({ length: Math.min(table.capacity || 4, 4) }, (_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-3 h-3 rounded-full',
                        order && i < Math.min(order.items?.length || 0, 4) ? 'bg-brand-500' : 'bg-white/10'
                      )}
                    />
                  ))}
                </div>
                {order ? (
                  <span className="text-xs font-mono text-brand-400">{formatCurrency(tableTotal)}</span>
                ) : (
                  <span className={`text-[10px] uppercase tracking-wider font-medium ${statusConfig[table.status]?.color}`}>
                    {statusConfig[table.status]?.label}
                  </span>
                )}
              </button>
            );
          })}
          {tables.length === 0 && (
            <div className="col-span-full text-center py-12 text-white/20">
              <Coffee size={32} className="mx-auto mb-3 opacity-30" />
              <p>No hay mesas configuradas</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTable ? (
          <motion.div
            key="order-panel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-80 shrink-0"
          >
            <GlassCard className="p-4 flex flex-col h-full max-h-[calc(100vh-140px)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-semibold">{activeTable?.name}</h3>
                  <p className="text-xs text-white/30">{activeTable?.capacity} comensales</p>
                </div>
                <button
                  onClick={() => setActiveTableId(null)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/30"
                >
                  <X size={16} />
                </button>
              </div>

              {!activeOrder ? (
                <div className="flex-1 flex items-center justify-center">
                  <button
                    onClick={handleCreateOrder}
                    className="px-6 py-3 bg-brand-500 hover:bg-brand-400 rounded-xl text-sm font-medium transition-all"
                  >
                    Iniciar Orden
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                    {activeItems.length === 0 ? (
                      <p className="text-center text-white/20 text-sm py-8">Agrega items del menú</p>
                    ) : (
                      activeItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03]">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{item.dish?.name || 'Item'}</p>
                            <p className="text-[10px] text-white/30">{formatCurrency(item.unit_price)} c/u</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleUpdateQty(item.id, -1)} className="p-1 hover:text-red-400">
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-mono w-5 text-center">{item.quantity}</span>
                            <button onClick={() => handleUpdateQty(item.id, 1)} className="p-1 hover:text-green-400">
                              <Plus size={14} />
                            </button>
                            <span className="text-sm font-medium w-16 text-right">{formatCurrency((item.unit_price || 0) * (item.quantity || 0))}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-2 pt-3 border-t border-white/5">
                    <h4 className="text-xs uppercase tracking-wider text-white/30 mb-2">Menú</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {dishes.filter((d) => d.available).slice(0, 10).map((dish) => (
                        <button
                          key={dish.id}
                          onClick={() => handleAddItem(dish)}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                        >
                          <span className="text-sm truncate">{dish.name}</span>
                          <span className="text-xs text-white/30 shrink-0 ml-2">{formatCurrency(dish.price)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 mt-auto">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-white/40">Total</span>
                      <span className="text-xl font-display font-bold text-brand-400">{formatCurrency(total)}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={handleSendToKitchen}
                        className="col-span-2 py-2.5 rounded-xl glass-card-hover text-sm transition-all flex items-center justify-center gap-1"
                      >
                        <Send size={14} /> KDS
                      </button>
                      <button
                        onClick={handleSplitBill}
                        className="py-2.5 rounded-xl glass-card-hover text-sm transition-all flex items-center justify-center gap-1"
                      >
                        <Split size={14} />
                      </button>
                      <button
                        onClick={handlePayment}
                        className="py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-sm font-medium transition-all flex items-center justify-center gap-1"
                      >
                        <CreditCard size={14} /> Cobrar
                      </button>
                    </div>
                  </div>
                </>
              )}
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div
            key="empty-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-80 shrink-0"
          >
            <GlassCard className="p-6 flex items-center justify-center h-64">
              <div className="text-center space-y-3">
                <Coffee size={32} className="text-white/10 mx-auto" />
                <p className="text-sm text-white/20">Selecciona una mesa</p>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {showSplitModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowSplitModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="glass-card p-6 w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-semibold text-lg mb-4">Dividir Cuenta</h3>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setSplitCount(Math.max(2, splitCount - 1))} className="p-2 glass-card rounded-xl">
                <Minus size={16} />
              </button>
              <span className="text-2xl font-display font-bold">{splitCount}</span>
              <button onClick={() => setSplitCount(splitCount + 1)} className="p-2 glass-card rounded-xl">
                <Plus size={16} />
              </button>
            </div>
            <p className="text-center text-white/40 text-sm mb-4">
              {formatCurrency(splitAmount)} por persona
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowSplitModal(false)} className="py-2.5 glass-card rounded-xl text-sm">
                Cancelar
              </button>
              <button
                onClick={() => { setShowSplitModal(false); toast.success('Cuenta dividida'); }}
                className="py-2.5 bg-brand-500 hover:bg-brand-400 rounded-xl text-sm font-medium"
              >
                Dividir
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
