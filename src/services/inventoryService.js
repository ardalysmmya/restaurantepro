import { supabase } from '../lib/supabase';

export const inventoryService = {
  getIngredients: (restaurantId) =>
    supabase.from('ingredients').select('*').eq('restaurant_id', restaurantId).order('name'),

  upsertIngredient: (ingredient) =>
    supabase.from('ingredients').upsert(ingredient).select().single(),

  deleteIngredient: (id) =>
    supabase.from('ingredients').delete().eq('id', id),

  adjustStock: async (restaurantId, ingredientId, qtyChange, notes = '') => {
    const { data: ing } = await supabase.from('ingredients').select('stock_qty').eq('id', ingredientId).single();
    const newQty = Math.max(0, (ing?.stock_qty || 0) + Number(qtyChange));
    await supabase.from('ingredients').update({ stock_qty: newQty, updated_at: new Date() }).eq('id', ingredientId);
    return supabase.from('inventory_movements').insert({
      restaurant_id: restaurantId,
      ingredient_id: ingredientId,
      qty_change: qtyChange,
      type: 'manual',
      notes,
    });
  },

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
      .lte('stock_qty', supabase.raw('COALESCE(min_stock, 5)'))
      .gt('stock_qty', 0),
};
