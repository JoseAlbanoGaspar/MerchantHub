'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button, Badge, Spinner } from '@/components/ui';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { ProductForm } from './product-form';
import { deleteProduct } from '@/app/actions/products';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductRowProps {
  product: Product;
  storeId: string;
}

export function ProductRow({ product, storeId }: ProductRowProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await deleteProduct(product.id, storeId);
    setDeleting(false);
  }

  return (
    <>
      <div className="flex items-center gap-4 rounded-xl border border-zinc-100 bg-white px-5 py-4 hover:border-zinc-200 hover:shadow-sm transition-all duration-150">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-zinc-900 truncate">{product.name}</p>
            <Badge variant={product.status === 'available' ? 'available' : 'unavailable'}>
              {product.status === 'available' ? 'Available' : 'Unavailable'}
            </Badge>
          </div>
          {product.description && (
            <p className="text-sm text-zinc-500 mt-0.5 line-clamp-1">{product.description}</p>
          )}
        </div>

        {/* Price */}
        <div className="text-base font-semibold text-zinc-900 tabular-nums shrink-0">
          {formatCurrency(product.price)}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-zinc-700"
            onClick={() => setEditOpen(true)}
            title="Edit product"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                title="Delete product"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{product.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This product will be permanently removed. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                  {deleting ? <Spinner className="text-white" /> : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the details for "{product.name}".</DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6">
            <ProductForm
              storeId={storeId}
              product={product}
              onSuccess={() => setEditOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
