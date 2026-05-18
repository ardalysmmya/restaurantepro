import { supabase } from '../lib/supabase';

export const analyticsService = {
  getDailyRevenue: async (restaurantId, days = 30) => {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const { data, error } = await supabase
      .from('orders')
      .select('total, created_at')
      .eq('restaurant_id', restaurantId)
      .eq('status', 'delivered')
      .gte('created_at', since.toISOString())
      .order('created_at');
    if (error) throw error;
    return data;
  },

  getTopDishes: (restaurantId, limit = 10) =>
    supabase.rpc('get_top_dishes', { p_restaurant_id: restaurantId, p_limit: limit }),

  getPeakHours: (restaurantId) =>
    supabase.rpc('get_peak_hours', { p_restaurant_id: restaurantId }),

  getProfitMargins: (restaurantId) =>
    supabase.rpc('get_profit_margins', { p_restaurant_id: restaurantId }),

  getKpis: (restaurantId) =>
    supabase.rpc('get_restaurant_kpis', { p_restaurant_id: restaurantId }),

  getRevenueByDay: (restaurantId, days = 7) => {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return supabase
      .from('orders')
      .select('total, created_at')
      .eq('restaurant_id', restaurantId)
      .eq('status', 'delivered')
      .gte('created_at', since.toISOString())
      .order('created_at');
  },

  getOrdersByHour: (restaurantId, date) =>
    supabase
      .from('orders')
      .select('created_at')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', `${date}T00:00:00`)
      .lt('created_at', `${date}T23:59:59`),
};
