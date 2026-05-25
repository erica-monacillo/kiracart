import { User, Product, Sale } from '../App';
import { supabase } from './supabaseClient';

/* ===================== AUTH API ===================== */

export const authAPI = {
  async signup(
    username: string,
    email: string,
    password: string,
    role: 'admin' | 'cashier',
    name: string
  ) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    // After signup, save the user profile info to 'profiles' table
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            username,
            email,
            role,
            name,
          }
        ]);
        
      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }
    }

    return { success: true, user: authData.user };
  },

  async login(username: string, password: string) {
    // First, lookup the email associated with the username in profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (profileError || !profiles) {
      throw new Error('User not found or invalid credentials');
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: profiles.email,
      password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    return {
      success: true,
      user: {
        id: profiles.id, // using string id for UI logic consistency
        username: profiles.username,
        role: profiles.role,
        name: profiles.name,
      }
    };
  },

  async verify(): Promise<{ success: boolean; user?: any }> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return { success: false };

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!profile) return { success: false };

    return { 
      success: true, 
      user: {
        id: profile.id,
        username: profile.username,
        role: profile.role,
        name: profile.name,
      }
    };
  },

  async logout() {
    await supabase.auth.signOut();
  },
};

/* ===================== SALES / TRANSACTIONS API ===================== */

type CreateTransactionPayload = {
  user_id: string; // Updated to string for UUID
  payment_method: string;
  total_amount: number;
  cashier: string;
  items: {
    product_id: number;
    quantity: number;
    price: number;
  }[];
};

export const salesAPI = {
  async getAll(): Promise<Sale[]> {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        items:transaction_items(*)
      `)
      .order('date_time', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (transactions || []).map((t: any) => ({
      transaction_id: t.transaction_id,
      receiptNumber: `RCP-${t.transaction_id}`,
      total: t.total_amount,
      paymentMethod: t.payment_method,
      cashierName: t.cashier,
      timestamp: new Date(t.date_time).toISOString(),
      items: t.items ?? [],
    }));
  },

  async create(payload: CreateTransactionPayload): Promise<Sale> {
    // 1. Insert transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: payload.user_id,
        payment_method: payload.payment_method,
        total_amount: payload.total_amount,
        cashier: payload.cashier,
      })
      .select()
      .single();

    if (txError || !transaction) {
      throw new Error(txError?.message || 'Failed to create transaction');
    }

    // 2. Insert items
    const itemsToInsert = payload.items.map(item => ({
      transaction_id: transaction.transaction_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.quantity * item.price,
    }));

    const { error: itemsError } = await supabase
      .from('transaction_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Failed to insert items:", itemsError.message);
    }

    return {
      transaction_id: transaction.transaction_id,
      receiptNumber: `RCP-${transaction.transaction_id}`,
      total: payload.total_amount,
      paymentMethod: payload.payment_method,
      cashierName: payload.cashier,
      timestamp: new Date().toISOString(),
      items: payload.items.map(i => ({
        product_id: i.product_id,
        product_name: '',
        quantity: i.quantity,
        price: i.price,
        subtotal: i.quantity * i.price,
      })),
    };
  },
};

/* ===================== SYSTEM ===================== */

export async function initializeDemoData() {
  return { success: true, message: 'Initialization handled in Supabase SQL.' };
}

export async function healthCheck() {
  const { error } = await supabase.from('profiles').select('id').limit(1);
  if (error) {
    return { status: 'error', error: error.message };
  }
  return { status: 'ok', timestamp: new Date().toISOString() };
}
