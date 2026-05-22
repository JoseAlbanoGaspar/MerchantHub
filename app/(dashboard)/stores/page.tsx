import { Suspense } from 'react';
import { Store } from 'lucide-react';
import { getStores } from '@/app/actions/stores';
import { StoreCard } from '@/components/stores/store-card';
import { CreateStoreButton } from '@/components/stores/create-store-button';

// ---------------------------------------------------------------------------
// Stats bar
// ---------------------------------------------------------------------------
function StoreStats({ stores }: { stores: Awaited<ReturnType<typeof getStores>> }) {
  const total    = stores.length;
  const active   = stores.filter((s) => s.status === 'active').length;
  const inactive = total - active;

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {[
        { label: 'Total Stores',    value: total,    color: 'text-zinc-900' },
        { label: 'Active',          value: active,   color: 'text-emerald-600' },
        { label: 'Inactive',        value: inactive, color: 'text-zinc-400' },
      ].map(({ label, value, color }) => (
        <div
          key={label}
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color}`} style={{ fontFamily: 'Syne, sans-serif' }}>
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default async function StoresPage() {
  const stores = await getStores();

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-slide-up">
        <div>
          <h1
            className="text-2xl font-bold text-zinc-900"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Your Stores
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Manage locations, hours, and product menus.
          </p>
        </div>
        <CreateStoreButton />
      </div>

      {/* Stats */}
      <div className="animate-slide-up animate-slide-up-delay-1">
        <StoreStats stores={stores} />
      </div>

      {/* Store grid */}
      <div className="animate-slide-up animate-slide-up-delay-2">
        {stores.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
              <Store className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="text-base font-semibold text-zinc-700">No stores yet</h3>
            <p className="mt-1 text-sm text-zinc-400 max-w-xs">
              Add your first store to start managing products and orders.
            </p>
            <div className="mt-6">
              <CreateStoreButton />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
