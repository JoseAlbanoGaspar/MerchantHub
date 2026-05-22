'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Input, FormField, ErrorAlert, Spinner } from '@/components/ui';
import { logIn } from '@/app/actions/auth';

const loginSchema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    const fd = new FormData();
    fd.append('email',    values.email);
    fd.append('password', values.password);
    const result = await logIn(fd);
    if (result?.error) setServerError(result.error);
  }

  return (
    <div className="animate-slide-up space-y-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold text-zinc-900" style={{ fontFamily: 'Syne, sans-serif' }}>
          Welcome back
        </h1>
        <p className="text-sm text-zinc-500">Sign in to your merchant account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}  method="post" className="space-y-5">
        {serverError && <ErrorAlert message={serverError} />}

        <FormField label="Email address" error={errors.email?.message}>
          <Input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
          />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <div className="relative">
            <Input
              {...register('password')}
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors z-10"
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <><Spinner className="text-white" /> Signing in…</>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-amber-600 hover:text-amber-700 transition-colors">
          Create one
        </Link>
      </p>

      
    </div>
  );
}
