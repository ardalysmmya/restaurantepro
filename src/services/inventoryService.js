import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/useAuthStore';

const getRealId = (idOrSlug) => {
  const { restaurants } = useAuthStore.getState();
  let found = restaurants.find((r) => r.slug === idOrSlug || r.id === idOrSlug);
  if (!found) {
    found = restaurants.find((r) => r.slug && r.slug.startsWith(idOrSlug));
  }
  return found ? found.id : idOrSlug;
};

export const inventoryService = {
  getIngredients: (restaurantId) =>
    supabase.from('ingredients').select('*').eq('restaurant_id', getRealId(restaurantId)).order('name'),

  upsertIngredient: (ingredient) => {
    const realId = getRealId(ingredient.restaurant_id);
    return supabase.from('ingredients').upsert({ ...ingredient, restaurant_id: realId }).select().single();
  },

  deleteIngredient: (id) =>
    supabase.from('ingredients').delete().eq('id', id),

  adjustStock: (restaurantId, ingredientId, qtyChange, notes = '') =>
    supabase.from('inventory_movements').insert({
      restaurant_id: getRealId(restaurantId),
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
      .eq('restaurant_id', getRealId(restaurantId))
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });
  },

  getLowStock: (restaurantId) =>
    supabase
      .from('ingredients')
      .select('*')
      .eq('restaurant_id', getRealId(restaurantId))
      .lt('stock_qty', supabase.raw('min_stock'))
      .gt('stock_qty', 0),
};
