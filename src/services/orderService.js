import { supabase } from '../lib/supabase';

export const orderService = {
  getTables: (restaurantId) =>
    supabase.from('tables').select('*').eq('restaurant_id', restaurantId).order('name'),

  updateTableStatus: (tableId, status) =>
    supabase.from('tables').update({ status }).eq('id', tableId),

  getActiveOrders: (restaurantId) =>
    supabase
      .from('orders')
      .select('*, table:tables(name, capacity), items:order_items(*, dish:dishes(name, price))')
      .eq('restaurant_id', restaurantId)
      .in('status', ['pending', 'cooking'])
      .order('created_at'),

  getOrdersByStatus: (restaurantId, status) =>
    supabase
      .from('orders')
      .select('*, table:tables(name), items:order_items(*, dish:dishes(name))')
      .eq('restaurant_id', restaurantId)
      .eq('status', status)
      .order('created_at'),

  createOrder: (order) =>
    supabase.from('orders').insert(order).select().single(),

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
    const channel = supabase
      .channel(`orders-${restaurantId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurantId}` },
        callback
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  },

  subscribeToTables: (restaurantId, callback) => {
    const channel = supabase
      .channel(`tables-${restaurantId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables', filter: `restaurant_id=eq.${restaurantId}` },
        callback
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  },

  subscribeToKitchen: (restaurantId, callback) => {
    const channel = supabase
      .channel(`kitchen-${restaurantId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items', filter: `status=neq.delivered` },
        callback
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
};
