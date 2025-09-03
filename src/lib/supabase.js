import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Auth functions
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  return { data, error };
};

export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { data, error };
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
};

// Database functions
export const createUser = async (userData) => {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select();
  return { data, error };
};

export const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('userId', userId)
    .single();
  return { data, error };
};

export const updateUser = async (userId, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('userId', userId)
    .select();
  return { data, error };
};

// Storage functions
export const uploadFile = async (bucket, path, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
  return { data, error };
};

export const getFileUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const deleteFile = async (bucket, path) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  return { data, error };
};

