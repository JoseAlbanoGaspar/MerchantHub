'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, FormField, ErrorAlert, Spinner } from '@/components/ui';
import { createStore, updateStore } from '@/app/actions/stores';
import { US_STATES, US_TIMEZONES } from '@/types';
import type { Store } from '@/types';

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------
const storeSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters').max(120),
  phone:    z.string().min(7, 'Enter a valid phone number').max(30),
  street:   z.string().min(3, 'Enter a street address').max(200),
  city:     z.string().min(2, 'Enter a city').max(100),
  state:    z.string().length(2, 'Select a state'),
  zip_code: z.string().regex(/^\d{5}(-\d{4})?$/, 'Enter a valid ZIP code (e.g. 10001)'),
  timezone: z.string().min(1, 'Select a timezone'),
});

type StoreFormValues = z.infer<typeof storeSchema>;

interface StoreFormProps {
  store?: Store;            // present when editing
  onSuccess?: () => void;  // called after successful save
}

export function StoreForm({ store, onSuccess }: StoreFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: store
      ? {
          name:     store.name,
          phone:    store.phone,
          street:   store.street,
          city:     store.city,
          state:    store.state,
          zip_code: store.zip_code,
          timezone: store.timezone,
        }
      : {
          timezone: 'America/New_York',
          state:    '',
        },
  });

  async function onSubmit(values: StoreFormValues) {
    setServerError(null);
    const result = store
      ? await updateStore(store.id, values)
      : await createStore(values);

    if (result?.error) {
      setServerError(result.error);
      return;
    }
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && <ErrorAlert message={serverError} />}

      <FormField label="Store Name" error={errors.name?.message}>
        <Input
          {...register('name')}
          placeholder="e.g. Bistro Mario — Midtown"
          autoFocus
        />
      </FormField>

      <FormField label="Phone Number" error={errors.phone?.message}>
        <Input
          {...register('phone')}
          placeholder="(212) 555-0100"
          type="tel"
        />
      </FormField>

      <FormField label="Street Address" error={errors.street?.message}>
        <Input {...register('street')} placeholder="350 5th Ave" />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="City" error={errors.city?.message}>
          <Input {...register('city')} placeholder="New York" />
        </FormField>

        <FormField label="ZIP Code" error={errors.zip_code?.message}>
          <Input {...register('zip_code')} placeholder="10001" maxLength={10} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="State" error={errors.state?.message}>
          <Select {...register('state')} defaultValue={store?.state ?? ''}>
            <option value="" disabled>Select state…</option>
            {US_STATES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Timezone" error={errors.timezone?.message}>
          <Select {...register('timezone')} defaultValue={store?.timezone ?? 'America/New_York'}>
            {US_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting ? (
            <><Spinner className="text-white" /> Saving…</>
          ) : store ? (
            'Save Changes'
          ) : (
            'Create Store'
          )}
        </Button>
      </div>
    </form>
  );
}
