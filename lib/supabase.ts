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
    detectSessionInUrl: false, // Disable for mobile apps
    flowType: 'pkce'
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

// Database types for better TypeScript support
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          company: string | null;
          position: string | null;
          gst_number: string | null;
          wallet_balance: number;
          created_at: string;
          updated_at: string;
          country: string | null;
          pincode: string | null;
          country_code: string | null;
          phone_number: string | null;
          phone_verified: boolean;
          phone_verification_code: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          company?: string | null;
          position?: string | null;
          gst_number?: string | null;
          wallet_balance?: number;
          country?: string | null;
          pincode?: string | null;
          country_code?: string | null;
          phone_number?: string | null;
          phone_verified?: boolean;
          phone_verification_code?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          company?: string | null;
          position?: string | null;
          gst_number?: string | null;
          wallet_balance?: number;
          country?: string | null;
          pincode?: string | null;
          country_code?: string | null;
          phone_number?: string | null;
          phone_verified?: boolean;
          phone_verification_code?: string | null;
        };
      };
    };
  };
}