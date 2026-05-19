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

export const recipeService = {
  getRecipes: (restaurantId) =>
    supabase
      .from('recipes')
      .select('*, dish:dishes(name, price, image_url), ingredients:recipe_ingredients(*, ingredient:ingredients(*))')
      .eq('restaurant_id', getRealId(restaurantId)),

  getRecipeByDish: (dishId) =>
    supabase
      .from('recipes')
      .select('*, ingredients:recipe_ingredients(*, ingredient:ingredients(*))')
      .eq('dish_id', dishId)
      .single(),

  upsertRecipe: (recipe) => {
    const realId = getRealId(recipe.restaurant_id);
    return supabase.from('recipes').upsert({ ...recipe, restaurant_id: realId }).select().single();
  },

  addIngredient: (entry) =>
    supabase.from('recipe_ingredients').upsert(entry).select().single(),

  removeIngredient: (id) =>
    supabase.from('recipe_ingredients').delete().eq('id', id),

  calculateCost: (dishId) =>
    supabase.rpc('calculate_dish_cost', { p_dish_id: dishId }),

  getProfitMargins: (restaurantId) =>
    supabase.rpc('get_profit_margins', { p_restaurant_id: getRealId(restaurantId) }),
};
