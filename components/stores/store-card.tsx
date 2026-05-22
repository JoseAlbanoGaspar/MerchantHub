'use client';

import { useState } from 'react';
import { MapPin, Phone, Clock, Pencil, PowerOff, Power } from 'lucide-react';
import Link from 'next/link';
import { Button, Badge, Card, CardHeader, CardContent, CardTitle, Spinner } from '@/components/ui';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { StoreForm } from './store-form';
import { deactivateStore, reactivateStore } from '@/app/actions/stores';
import type { Store } from '@/types';

interface StoreCardProps {
  store: Store;
}

export function StoreCard({ store }: StoreCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [toggling, setToggling] = useState(false);

  const isActive = store.status === 'active';

  async function handleToggleStatus() {
    setToggling(true);
    if (isActive) {
      await deactivateStore(store.id);
    } else {
      await reactivateStore(store.id);
    }
    setToggling(false);
  }

  const tzLabel =
    store.timezone.replace('America/', '').replace('Pacific/', '').replace('_', ' ');

  return (
    <>
      <Card className="flex flex-col hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="truncate">{store.name}</CardTitle>
              <p className="text-xs text-zinc-400 mt-0.5">
                Added {new Date(store.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <Badge variant={isActive ? 'active' : 'inactive'}>
              <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-2.5">
          <div className="flex items-start gap-2 text-sm text-zinc-600">
            <MapPin className="h-3.5 w-3.5 mt-0.5 text-zinc-400 shrink-0" />
            <span>
              {store.street}, {store.city}, {store.state} {store.zip_code}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Phone className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <span>{store.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <span>{tzLabel}</span>
          </div>
        </CardContent>

        {/* Actions */}
        <div className="px-6 pb-5 pt-2 flex items-center gap-2 border-t border-zinc-100 mt-2">
          <Link href={`/stores/${store.id}/products`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              View Products
            </Button>
          </Link>

          {/* Edit */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setEditOpen(true)}
            title="Edit store"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          {/* Deactivate / Reactivate */}
          {isActive ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-red-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                  title="Deactivate store"
                >
                  <PowerOff className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Deactivate "{store.name}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will mark the store as <strong>inactive</strong> and set all its products
                    to <strong>unavailable</strong>. You can reactivate it at any time.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleToggleStatus} disabled={toggling}>
                    {toggling ? <Spinner className="text-white" /> : null}
                    Deactivate
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0 text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50"
              title="Reactivate store"
              onClick={handleToggleStatus}
              disabled={toggling}
            >
              {toggling ? (
                <Spinner className="text-emerald-600" />
              ) : (
                <Power className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
            <DialogDescription>Update the details for "{store.name}".</DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6">
            <StoreForm store={store} onSuccess={() => setEditOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
