'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button, Input, Textarea, Select, FormField, ErrorAlert, Spinner,
} from '@/components/ui';
import { createProduct, updateProduct } from '@/app/actions/products';
import type { Product } from '@/types';

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------
const productSchema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters').max(120),
  description: z.string().max(1000, 'Description must be 1000 characters or fewer').optional(),
  price:       z
    .string()
    .min(1, 'Price is required')
    .refine(
      (v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0,
      'Enter a valid price (e.g. 12.99)'
    ),
  status: z.enum(['available', 'unavailable']),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  storeId: string;
  product?: Product;
  onSuccess?: () => void;
}

export function ProductForm({ storeId, product, onSuccess }: ProductFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name:        product.name,
          description: product.description ?? '',
          price:       product.price.toFixed(2),
          status:      product.status,
        }
      : {
          status: 'available',
          description: '',
        },
  });

  async function onSubmit(values: ProductFormValues) {
    setServerError(null);
    const payload = { ...values, description: values.description ?? '' };
    const result = product
      ? await updateProduct(product.id, storeId, payload)
      : await createProduct(storeId, payload);

    if (result?.error) {
      setServerError(result.error);
      return;
    }
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && <ErrorAlert message={serverError} />}

      <FormField label="Product Name" error={errors.name?.message}>
        <Input
          {...register('name')}
          placeholder="e.g. Margherita Pizza"
          autoFocus
        />
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <Textarea
          {...register('description')}
          placeholder="Brief description of the product…"
          rows={3}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Price (USD)" error={errors.price?.message}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
            <Input
              {...register('price')}
              placeholder="0.00"
              className="pl-7"
              inputMode="decimal"
            />
          </div>
        </FormField>

        <FormField label="Availability" error={errors.status?.message}>
          <Select {...register('status')} defaultValue={product?.status ?? 'available'}>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </Select>
        </FormField>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting ? (
            <><Spinner className="text-white" /> Saving…</>
          ) : product ? (
            'Save Changes'
          ) : (
            'Add Product'
          )}
        </Button>
      </div>
    </form>
  );
}
