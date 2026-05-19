export { deductInventoryForOrder, calculateMargin } from './inventory-engine';
// Inventory deduction and margin calculation happen via DB triggers (deduct_inventory_on_order, calculate_dish_cost).
// Client-side helpers are reserved for offline/optimistic UI scenarios.
