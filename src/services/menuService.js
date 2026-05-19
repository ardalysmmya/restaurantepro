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

const rpc = async (fn, args = {}) => {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw error;
  return data;
};

export const menuService = {
  getCategories: (restaurantId) =>
    supabase.from('menu_categories').select('*').eq('restaurant_id', getRealId(restaurantId)).order('sort_order'),

  createCategory: (category) => {
    const realId = getRealId(category.restaurant_id);
    return supabase.from('menu_categories').insert({ ...category, restaurant_id: realId }).select().single();
  },

  getDishes: (restaurantId) =>
    supabase.from('dishes').select('*, category:menu_categories(name)').eq('restaurant_id', getRealId(restaurantId)).order('name'),

  upsertDish: (dish) => {
    const realId = getRealId(dish.restaurant_id);
    return supabase.from('dishes').upsert({ ...dish, restaurant_id: realId }).select().single();
  },

  deleteDish: (id) =>
    supabase.from('dishes').delete().eq('id', id),

  toggleDishAvailability: (id, available) =>
    supabase.from('dishes').update({ available, updated_at: new Date() }).eq('id', id),
};
