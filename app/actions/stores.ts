'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { StoreFormData } from '@/types';

// ---------------------------------------------------------------------------
// Create Store
// ---------------------------------------------------------------------------
export async function createStore(data: StoreFormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase.from('stores').insert({
    merchant_id: user.id,
    ...data,
  });

  if (error) return { error: error.message };

  revalidatePath('/stores');
  return { success: true };
}

// ---------------------------------------------------------------------------
// Update Store
// ---------------------------------------------------------------------------
export async function updateStore(storeId: string, data: StoreFormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // RLS ensures the merchant can only update their own store
  const { error } = await supabase
    .from('stores')
    .update(data)
    .eq('id', storeId);

  if (error) return { error: error.message };

  revalidatePath('/stores');
  return { success: true };
}

// ---------------------------------------------------------------------------
// Deactivate Store
// Calls the database function which also marks all products as unavailable
// ---------------------------------------------------------------------------
export async function deactivateStore(storeId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase.rpc('deactivate_store', {
    p_store_id: storeId,
  });

  if (error) return { error: error.message };

  revalidatePath('/stores');
  return { success: true };
}

// ---------------------------------------------------------------------------
// Reactivate Store
// ---------------------------------------------------------------------------
export async function reactivateStore(storeId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase
    .from('stores')
    .update({ status: 'active' })
    .eq('id', storeId);

  if (error) return { error: error.message };

  revalidatePath('/stores');
  return { success: true };
}

// ---------------------------------------------------------------------------
// Fetch all stores for the current merchant (server-side)
// ---------------------------------------------------------------------------
export async function getStores() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Fetch a single store (verifying ownership via RLS)
// ---------------------------------------------------------------------------
export async function getStore(storeId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .single();

  if (error) return null;
  return data;
}
