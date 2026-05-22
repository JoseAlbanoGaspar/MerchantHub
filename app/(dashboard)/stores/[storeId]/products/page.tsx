import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, Phone, Package, CheckCircle2, XCircle,
} from 'lucide-react';
import { getStore } from '@/app/actions/stores';
import { getProducts } from '@/app/actions/products';
import { ProductRow } from '@/components/products/product-row';
import { AddProductButton } from '@/components/products/add-product-button';
import { Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

interface ProductsPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { storeId } = await params;

  const [store, products] = await Promise.all([
    getStore(storeId),
    getProducts(storeId),
  ]);

  if (!store) notFound();

  const available   = products.filter((p) => p.status === 'available').length;
  const unavailable = products.length - available;
  const totalValue  = products.reduce((sum, p) => sum + Number(p.price), 0);

  return (
    <div className="animate-slide-up space-y-6">
      {/* Back link */}
      <Link
        href="/stores"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Back to Stores
      </Link>

      {/* Store header */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-6 animate-slide-up animate-slide-up-delay-1">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1
                className="text-xl font-bold text-zinc-900"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                {store.name}
              </h1>
              <Badge variant={store.status === 'active' ? 'active' : 'inactive'}>
                <span className={`h-1.5 w-1.5 rounded-full ${store.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                {store.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                {store.street}, {store.city}, {store.state} {store.zip_code}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-zinc-400" />
                {store.phone}
              </span>
            </div>
          </div>
          <AddProductButton storeId={storeId} />
        </div>

        {/* Mini stats */}
        <div className="mt-5 pt-5 border-t border-zinc-100 grid grid-cols-3 gap-4 sm:gap-6">
          {[
            { icon: Package,      label: 'Total Products', value: products.length,          color: 'text-zinc-900' },
            { icon: CheckCircle2, label: 'Available',      value: available,                color: 'text-emerald-600' },
            { icon: XCircle,      label: 'Unavailable',    value: unavailable,              color: 'text-orange-500' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="text-center sm:text-left">
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium flex items-center justify-center sm:justify-start gap-1.5 mb-0.5">
                <Icon className={`h-3.5 w-3.5 ${color}`} />
                {label}
              </p>
              <p className={`text-2xl font-bold ${color}`} style={{ fontFamily: 'Syne, sans-serif' }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Products list */}
      <div className="animate-slide-up animate-slide-up-delay-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-zinc-700">
            Products
            {products.length > 0 && (
              <span className="ml-2 text-sm font-normal text-zinc-400">
                ({products.length})
              </span>
            )}
          </h2>
          {products.length > 0 && (
            <span className="text-sm text-zinc-400">
              Avg. price:{' '}
              <span className="font-medium text-zinc-600">
                {formatCurrency(totalValue / products.length)}
              </span>
            </span>
          )}
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
              <Package className="h-5 w-5 text-amber-500" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-700">No products yet</h3>
            <p className="mt-1 text-xs text-zinc-400 max-w-xs">
              Add your first product to start building this store's menu.
            </p>
            <div className="mt-5">
              <AddProductButton storeId={storeId} />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {products.map((product) => (
              <ProductRow key={product.id} product={product} storeId={storeId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
