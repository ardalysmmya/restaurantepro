import { supabase } from '../lib/supabase';

export const recipeService = {
  getRecipes: (restaurantId) =>
    supabase
      .from('recipes')
      .select('*, dish:dishes(name, price, image_url), ingredients:recipe_ingredients(*, ingredient:ingredients(*))')
      .eq('restaurant_id', restaurantId),

  getRecipeByDish: (dishId) =>
    supabase
      .from('recipes')
      .select('*, ingredients:recipe_ingredients(*, ingredient:ingredients(*))')
      .eq('dish_id', dishId)
      .single(),

  upsertRecipe: (recipe) =>
    supabase.from('recipes').upsert(recipe).select().single(),

  addIngredient: (entry) =>
    supabase.from('recipe_ingredients').upsert(entry).select().single(),

  removeIngredient: (id) =>
    supabase.from('recipe_ingredients').delete().eq('id', id),

  calculateCost: (dishId) =>
    supabase.rpc('calculate_dish_cost', { p_dish_id: dishId }),

  getProfitMargins: (restaurantId) =>
    supabase.rpc('get_profit_margins', { p_restaurant_id: restaurantId }),
};
