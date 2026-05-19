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

export const crmService = {
  getDiners: (restaurantId) =>
    supabase
      .from('diners')
      .select('*, loyalty:loyalty_points(points, tier)')
      .eq('restaurant_id', getRealId(restaurantId))
      .order('created_at', { ascending: false }),

  getDinerById: (id) =>
    supabase
      .from('diners')
      .select('*, favorites:diner_favorites(dish:dishes(*)), loyalty:loyalty_points(*)')
      .eq('id', id)
      .single(),

  upsertDiner: (diner) => {
    const realId = getRealId(diner.restaurant_id);
    return supabase.from('diners').upsert({ ...diner, restaurant_id: realId }).select().single();
  },

  addFavorite: (dinerId, dishId) =>
    supabase.from('diner_favorites').upsert({ diner_id: dinerId, dish_id: dishId }),

  removeFavorite: (id) =>
    supabase.from('diner_favorites').delete().eq('id', id),

  getLoyaltyPoints: (dinerId, restaurantId) =>
    supabase
      .from('loyalty_points')
      .select('*')
      .eq('diner_id', dinerId)
      .eq('restaurant_id', getRealId(restaurantId))
      .single(),

  getLoyaltyHistory: (dinerId, restaurantId) =>
    supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('diner_id', dinerId)
      .eq('restaurant_id', getRealId(restaurantId))
      .order('created_at', { ascending: false }),

  getCampaigns: (restaurantId) =>
    supabase.from('campaigns').select('*').eq('restaurant_id', getRealId(restaurantId)),

  createCampaign: (campaign) => {
    const realId = getRealId(campaign.restaurant_id);
    return supabase.from('campaigns').insert({ ...campaign, restaurant_id: realId }).select().single();
  },

  toggleCampaign: (id, active) =>
    supabase.from('campaigns').update({ active }).eq('id', id),

  getDinerCampaigns: (dinerId, restaurantId) =>
    supabase
      .from('campaign_redemptions')
      .select('*, campaign:campaigns(*)')
      .eq('diner_id', dinerId)
      .order('redeemed_at', { ascending: false }),
};
