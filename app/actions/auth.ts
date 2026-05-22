'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// Sign Up
// ---------------------------------------------------------------------------
export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email    = formData.get('email')    as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      // In production you'd set emailRedirectTo to your confirmation URL
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/stores');
}

// ---------------------------------------------------------------------------
// Log In
// ---------------------------------------------------------------------------
export async function logIn(formData: FormData) {
  const supabase = await createClient();

  const email    = formData.get('email')    as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/stores');
}

// ---------------------------------------------------------------------------
// Log Out
// ---------------------------------------------------------------------------
export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
