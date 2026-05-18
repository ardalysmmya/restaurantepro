import { create } from 'zustand';

export const useMenuStore = create((set) => ({
  categories: [],
  dishes: [],
  recipes: [],
  ingredients: [],

  setCategories: (categories) => set({ categories }),
  addCategory: (category) =>
    set((state) => ({ categories: [...state.categories, category] })),
  removeCategory: (id) =>
    set((state) => ({ categories: state.categories.filter((c) => c.id !== id) })),

  setDishes: (dishes) => set({ dishes }),
  addDish: (dish) => set((state) => ({ dishes: [...state.dishes, dish] })),
  updateDish: (id, updates) =>
    set((state) => ({
      dishes: state.dishes.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),
  removeDish: (id) =>
    set((state) => ({ dishes: state.dishes.filter((d) => d.id !== id) })),

  setRecipes: (recipes) => set({ recipes }),
  addRecipe: (recipe) =>
    set((state) => ({ recipes: [...state.recipes, recipe] })),
  removeRecipe: (id) =>
    set((state) => ({ recipes: state.recipes.filter((r) => r.id !== id) })),

  setIngredients: (ingredients) => set({ ingredients }),
}));
