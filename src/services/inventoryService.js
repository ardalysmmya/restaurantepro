import { supabase } from '../lib/supabase';

export const inventoryService = {
  getIngredients: (restaurantId) =>
    supabase.from('ingredients').select('*').eq('restaurant_id', restaurantId).order('name'),

  upsertIngredient: (ingredient) =>
    supabase.from('ingredients').upsert(ingredient).select().single(),

  deleteIngredient: (id) =>
    supabase.from('ingredients').delete().eq('id', id),

  adjustStock: (restaurantId, ingredientId, qtyChange, notes = '') =>
    supabase.from('inventory_movements').insert({
      restaurant_id: restaurantId,
      ingredient_id: ingredientId,
      qty_change: qtyChange,
      type: 'manual',
      notes,
    }),

  getMovements: (restaurantId, days = 30) => {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return supabase
      .from('inventory_movements')
      .select('*, ingredient:ingredients(name, unit)')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });
  },

  getLowStock: (restaurantId) =>
    supabase
      .from('ingredients')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .lt('stock_qty', supabase.raw('min_stock'))
      .gt('stock_qty', 0),
};
