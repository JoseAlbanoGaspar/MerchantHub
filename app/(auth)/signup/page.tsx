'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Input, FormField, ErrorAlert, Spinner } from '@/components/ui';
import { signUp } from '@/app/actions/auth';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(80),
  email:    z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupValues) {
    setServerError(null);
    const fd = new FormData();
    fd.append('fullName', values.fullName);
    fd.append('email',    values.email);
    fd.append('password', values.password);
    const result = await signUp(fd);
    if (result?.error) setServerError(result.error);
  }

  return (
    <div className="animate-slide-up space-y-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold text-zinc-900" style={{ fontFamily: 'Syne, sans-serif' }}>
          Create your account
        </h1>
        <p className="text-sm text-zinc-500">Start managing your stores and products</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} method="post" className="space-y-5">
        {serverError && <ErrorAlert message={serverError} />}

        <FormField label="Full Name" error={errors.fullName?.message}>
          <Input
            {...register('fullName')}
            placeholder="Mario Rossi"
            autoComplete="name"
            autoFocus
          />
        </FormField>

        <FormField label="Email address" error={errors.email?.message}>
          <Input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </FormField>

        <FormField
          label="Password"
          error={errors.password?.message}
        >
          <div className="relative">
            <Input
              {...register('password')}
              type={showPwd ? 'text' : 'password'}
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              autoComplete="new-password"
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

        <FormField label="Confirm Password" error={errors.confirm?.message}>
          <Input
            {...register('confirm')}
            type="password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />
        </FormField>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <><Spinner className="text-white" /> Creating account…</>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-amber-600 hover:text-amber-700 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
