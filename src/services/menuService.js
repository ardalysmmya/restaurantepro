import { supabase } from '../lib/supabase';

const rpc = async (fn, args = {}) => {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw error;
  return data;
};

export const menuService = {
  getCategories: (restaurantId) =>
    supabase.from('menu_categories').select('*').eq('restaurant_id', restaurantId).order('sort_order'),

  createCategory: (category) =>
    supabase.from('menu_categories').insert(category).select().single(),

  getDishes: (restaurantId) =>
    supabase.from('dishes').select('*, category:menu_categories(name)').eq('restaurant_id', restaurantId).order('name'),

  upsertDish: (dish) =>
    supabase.from('dishes').upsert(dish).select().single(),

  deleteDish: (id) =>
    supabase.from('dishes').delete().eq('id', id),

  toggleDishAvailability: (id, available) =>
    supabase.from('dishes').update({ available, updated_at: new Date() }).eq('id', id),
};
