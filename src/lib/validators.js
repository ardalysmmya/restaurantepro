import { z } from 'zod';

export const recipeSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  category: z.string().min(1, 'Selecciona una categoría'),
  price: z.number().min(0, 'El precio no puede ser negativo'),
  ingredients: z.array(z.object({
    ingredient_id: z.string().uuid(),
    quantity_grams: z.number().min(0),
  })).min(1, 'Agrega al menos un ingrediente'),
});

export const dinerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  allergies: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const campaignSchema = z.object({
  name: z.string().min(3),
  type: z.enum(['discount', 'points_multiplier', 'free_item', 'birthday']),
  value: z.number().min(1),
  min_visits: z.number().min(0).default(0),
  expires_in_days: z.number().min(1).default(30),
});
