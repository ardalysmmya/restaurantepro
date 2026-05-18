import { supabase } from '../lib/supabase';

export const crmService = {
  getDiners: (restaurantId) =>
    supabase
      .from('diners')
      .select('*, loyalty:loyalty_points(points, tier)')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false }),

  getDinerById: (id) =>
    supabase
      .from('diners')
      .select('*, favorites:diner_favorites(dish:dishes(*)), loyalty:loyalty_points(*)')
      .eq('id', id)
      .single(),

  upsertDiner: (diner) =>
    supabase.from('diners').upsert(diner).select().single(),

  addFavorite: (dinerId, dishId) =>
    supabase.from('diner_favorites').upsert({ diner_id: dinerId, dish_id: dishId }),

  removeFavorite: (id) =>
    supabase.from('diner_favorites').delete().eq('id', id),

  getLoyaltyPoints: (dinerId, restaurantId) =>
    supabase
      .from('loyalty_points')
      .select('*')
      .eq('diner_id', dinerId)
      .eq('restaurant_id', restaurantId)
      .single(),

  getLoyaltyHistory: (dinerId, restaurantId) =>
    supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('diner_id', dinerId)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false }),

  getCampaigns: (restaurantId) =>
    supabase.from('campaigns').select('*').eq('restaurant_id', restaurantId),

  createCampaign: (campaign) =>
    supabase.from('campaigns').insert(campaign).select().single(),

  toggleCampaign: (id, active) =>
    supabase.from('campaigns').update({ active }).eq('id', id),

  getDinerCampaigns: (dinerId, restaurantId) =>
    supabase
      .from('campaign_redemptions')
      .select('*, campaign:campaigns(*)')
      .eq('diner_id', dinerId)
      .order('redeemed_at', { ascending: false }),
};
