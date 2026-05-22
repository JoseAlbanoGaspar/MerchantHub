'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ProductFormData } from '@/types';

// ---------------------------------------------------------------------------
// Create Product
// ---------------------------------------------------------------------------
export async function createProduct(storeId: string, data: ProductFormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase.from('products').insert({
    store_id:    storeId,
    name:        data.name,
    description: data.description || null,
    price:       parseFloat(data.price),
    status:      data.status,
  });

  if (error) return { error: error.message };

  revalidatePath(`/stores/${storeId}/products`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Update Product
// ---------------------------------------------------------------------------
export async function updateProduct(
  productId: string,
  storeId: string,
  data: ProductFormData
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase
    .from('products')
    .update({
      name:        data.name,
      description: data.description || null,
      price:       parseFloat(data.price),
      status:      data.status,
    })
    .eq('id', productId);

  if (error) return { error: error.message };

  revalidatePath(`/stores/${storeId}/products`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Delete Product
// ---------------------------------------------------------------------------
export async function deleteProduct(productId: string, storeId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) return { error: error.message };

  revalidatePath(`/stores/${storeId}/products`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Fetch products for a store
// ---------------------------------------------------------------------------
export async function getProducts(storeId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}
