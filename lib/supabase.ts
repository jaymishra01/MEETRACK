import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper functions for common operations
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getWalletBalance(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('wallet_balance')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data?.wallet_balance || 0;
}

export async function updateWalletBalance(userId: string, amount: number) {
  const { error } = await supabase
    .from('users')
    .update({ wallet_balance: amount })
    .eq('id', userId);

  if (error) throw error;
}

export async function createTransaction(
  userId: string,
  amount: number,
  type: 'credit' | 'debit',
  description: string
) {
  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      amount,
      type,
      description,
      status: 'completed'
    });

  if (error) throw error;
}