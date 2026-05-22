'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, LogOut, ChefHat, Menu, X } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import { logOut } from '@/app/actions/auth';
import { cn } from '@/lib/utils';
import type { Merchant } from '@/types';

interface NavbarProps {
  merchant: Merchant;
}

export function Navbar({ merchant }: NavbarProps) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (merchant.full_name ?? merchant.email)
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  async function handleLogout() {
    setLoggingOut(true);
    await logOut();
  }

  const navLinks = [
    { href: '/stores', label: 'Stores', icon: Store },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/stores" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 shadow-sm shadow-amber-500/30 group-hover:bg-amber-600 transition-colors">
            <ChefHat className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-zinc-900 tracking-tight">
            MerchantHub
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white shadow-sm">
              {initials}
            </div>
            <span className="text-sm text-zinc-600 max-w-[140px] truncate">
              {merchant.full_name ?? merchant.email}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
            className="hidden sm:flex text-zinc-500 hover:text-red-600 hover:bg-red-50"
          >
            {loggingOut ? <Spinner /> : <LogOut className="h-4 w-4" />}
            <span className="sr-only">Log out</span>
          </Button>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-zinc-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium',
                pathname.startsWith(href)
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-zinc-600 hover:bg-zinc-50'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-zinc-100 mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white">
                {initials}
              </div>
              <span className="text-sm text-zinc-600 truncate max-w-[180px]">
                {merchant.full_name ?? merchant.email}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-red-500"
            >
              {loggingOut ? <Spinner className="text-red-500" /> : <LogOut className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
