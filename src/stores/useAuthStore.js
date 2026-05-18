import { create } from 'zustand';
import { supabase, signInWithEmail, signInWithGoogle, signOut, onAuthChange } from '../lib/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  profile: null,
  restaurants: [],
  activeRestaurantId: null,
  loading: true,
  error: null,

  init: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ session, user: session.user });
        await get().loadProfile(session.user.id);
        await get().loadRestaurants(session.user.id);
      }
    } catch (e) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }

    onAuthChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        set({ session, user: session.user });
        await get().loadProfile(session.user.id);
        await get().loadRestaurants(session.user.id);
      }
      if (event === 'SIGNED_OUT') {
        set({ user: null, session: null, profile: null, restaurants: [], activeRestaurantId: null });
      }
    });
  },

  loadProfile: async (userId) => {
    const { data } = await supabase
      .from('restaurant_staff')
      .select('*, restaurant:restaurants(*)')
      .eq('user_id', userId)
      .single();
    set({ profile: data });
  },

  loadRestaurants: async (userId) => {
    const { data: owned } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', userId);
    const { data: staff } = await supabase
      .from('restaurant_staff')
      .select('restaurant:restaurants(*), role')
      .eq('user_id', userId);
    const all = [
      ...(owned || []).map((r) => ({ ...r, role: 'owner' })),
      ...(staff || []).map((s) => ({ ...s.restaurant, role: s.role })),
    ];
    const unique = Array.from(new Map(all.map((r) => [r.id, r])).values());
    set({ restaurants: unique });
  },

  loginWithEmail: async (email, password) => {
    set({ error: null });
    try {
      return await signInWithEmail(email, password);
    } catch (e) {
      set({ error: e.message });
      throw e;
    }
  },

  loginWithGoogle: async () => {
    set({ error: null });
    try {
      return await signInWithGoogle();
    } catch (e) {
      set({ error: e.message });
      throw e;
    }
  },

  logout: async () => {
    await signOut();
    set({ user: null, session: null, profile: null, restaurants: [], activeRestaurantId: null });
  },

  setActiveRestaurant: (id) => set({ activeRestaurantId: id }),
}));
