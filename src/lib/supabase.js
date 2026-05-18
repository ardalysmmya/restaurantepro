import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/?app=admin` },
  });
  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signUpWithEmail = async (email, password, name) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${window.location.origin}/?app=admin`,
    },
  });
  if (error) throw error;
  return data;
};

export const signOut = () => supabase.auth.signOut();

export const getSession = () => supabase.auth.getSession();

export const onAuthChange = (callback) =>
  supabase.auth.onAuthStateChange((event, session) => callback(event, session));

export const uploadImage = async (restaurantId, file, folder) => {
  const ext = file.name.split('.').pop();
  const path = `${restaurantId}/${folder}/${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage
    .from('restaurant-media')
    .upload(path, file, { upsert: true, cacheControl: '31536000' });
  if (error) throw error;
  const { data: urlData } = supabase.storage
    .from('restaurant-media')
    .getPublicUrl(data.path);
  return urlData.publicUrl;
};
