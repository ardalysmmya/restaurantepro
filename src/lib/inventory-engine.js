import { recipeService } from '../services/recipeService';
import { inventoryService } from '../services/inventoryService';

export async function deductInventoryForOrder(restaurantId, orderItem) {
  const { data: recipe } = await recipeService.getRecipeByDish(orderItem.dish_id);
  if (!recipe) return;

  for (const ri of recipe.ingredients) {
    const totalQty = ri.qty_per_serv * orderItem.quantity;
    await inventoryService.adjustStock(
      restaurantId,
      ri.ingredient_id,
      -totalQty,
      `Venta: ${orderItem.id}`
    );
  }
}

export async function calculateMargin(dishId) {
  const { data: dish } = await recipeService.getRecipeByDish(dishId);
  if (!dish) return null;
  const { data: cost } = await recipeService.calculateCost(dishId);
  const price = dish.price || 0;
  const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
  return { cost, price, margin, profit: price - cost };
}

export async function recalculateOrderTotals(orderId) {
  return recipeService.supabase?.rpc?.('recalculate_order_totals', { p_order_id: orderId });
}
