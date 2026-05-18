import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/useAuthStore';

const getRealId = (idOrSlug) => {
  const { restaurants } = useAuthStore.getState();
  const found = restaurants.find((r) => r.slug === idOrSlug || r.id === idOrSlug);
  return found ? found.id : idOrSlug;
};

export const orderService = {
  getTables: (restaurantId) =>
    supabase.from('tables').select('*').eq('restaurant_id', getRealId(restaurantId)).order('name'),

  updateTableStatus: (tableId, status) =>
    supabase.from('tables').update({ status }).eq('id', tableId),

  getActiveOrders: (restaurantId) =>
    supabase
      .from('orders')
      .select('*, table:tables(name, capacity), items:order_items(*, dish:dishes(name, price))')
      .eq('restaurant_id', getRealId(restaurantId))
      .in('status', ['pending', 'cooking'])
      .order('created_at'),

  getOrdersByStatus: (restaurantId, status) =>
    supabase
      .from('orders')
      .select('*, table:tables(name), items:order_items(*, dish:dishes(name))')
      .eq('restaurant_id', getRealId(restaurantId))
      .eq('status', status)
      .order('created_at'),

  createOrder: (order) => {
    const realId = getRealId(order.restaurant_id);
    return supabase.from('orders').insert({ ...order, restaurant_id: realId }).select().single();
  },

  addItemToOrder: (item) =>
    supabase.from('order_items').insert(item).select().single(),

  removeItemFromOrder: (itemId) =>
    supabase.from('order_items').delete().eq('id', itemId),

  updateItemStatus: (itemId, status) =>
    supabase.from('order_items').update({ status }).eq('id', itemId),

  updateOrderStatus: (orderId, status, extra = {}) =>
    supabase.from('orders').update({ status, ...extra }).eq('id', orderId),

  updateOrderTotals: (orderId) =>
    supabase.rpc('recalculate_order_totals', { p_order_id: orderId }),

  subscribeToOrders: (restaurantId, callback) => {
    const realId = getRealId(restaurantId);
    const channel = supabase
      .channel(`orders-${realId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${realId}` },
        callback
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  },

  subscribeToTables: (restaurantId, callback) => {
    const realId = getRealId(restaurantId);
    const channel = supabase
      .channel(`tables-${realId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables', filter: `restaurant_id=eq.${realId}` },
        callback
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  },

  subscribeToKitchen: (restaurantId, callback) => {
    const channel = supabase
      .channel(`kitchen-${getRealId(restaurantId)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items', filter: `status=neq.delivered` },
        callback
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
};
