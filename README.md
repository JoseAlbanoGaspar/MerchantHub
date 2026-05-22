# MerchantHub — Merchant Dashboard

A full-stack merchant dashboard for a multi-store food delivery platform,
built with React, Next.js, Supabase, and Tailwind CSS.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy the env template and fill in your Supabase project credentials
cp .env.example .env.local

# 3. Apply database migrations via Supabase SQL Editor or CLI (in order):
#    supabase/migrations/001_schema.sql
#    supabase/migrations/002_rls.sql
#    supabase/migrations/003_seed.sql

# 4. Start the dev server
npm run dev
```

Visit http://localhost:3000 — middleware auto-redirects to /login.

Demo credentials (after running seed):
  mario@bistromario.com   / Seed@1234
  sofia@seoulkitchen.com  / Seed@1234
  james@jerkhouse.com     / Seed@1234

---

# Features
- Authentication: log in/out + sign in (must enter a valid email to activate supabase email verification feature)
- Stores: CRUD operations
- Products: CRUD operations

## Tech Stack

- Framework:   Next.js (App Router, Server Components, Server Actions)
- Styling:     Tailwind CSS v4 + custom design tokens
- UI:          Hand-rolled components with Radix UI primitives + CVA
- Forms:       React Hook Form + Zod
- Auth:        Supabase Auth (email/password)
- Database:    Supabase/PostgreSQL with RLS
- Session:     @supabase/ssr with Next.js middleware

---

## Project Structure
```
app/
  (auth)/layout.tsx              Split-panel auth layout (public)
  (auth)/login/page.tsx
  (auth)/signup/page.tsx
  (dashboard)/layout.tsx         Protected layout — fetches merchant, renders Navbar
  (dashboard)/stores/page.tsx    Store grid + stats
  (dashboard)/stores/[storeId]/products/page.tsx
  actions/auth.ts                Server Actions: signUp, logIn, logOut
  actions/stores.ts              Server Actions: CRUD + deactivate
  actions/products.ts            Server Actions: CRUD
components/
  layout/navbar.tsx
  stores/store-card.tsx
  stores/store-form.tsx
  stores/create-store-button.tsx
  products/product-row.tsx
  products/product-form.tsx
  products/add-product-button.tsx
  ui/index.tsx                   Button, Input, Badge, Card, FormField, ...
  ui/dialog.tsx
  ui/alert-dialog.tsx
lib/supabase/client.ts           Browser client
lib/supabase/server.ts           Server client (cookie-based)
middleware.ts                    Session refresh + route guard
types/index.ts                   All TypeScript interfaces
supabase/migrations/
  001_schema.sql                 Tables, triggers, helper functions
  002_rls.sql                    Row Level Security policies + grants
  003_seed.sql                   3 merchants, 6 stores, 16 products
```
---

## Database Design

### Schema
```
auth.users  (Supabase managed)
     |  trigger: handle_new_user()
     v
public.merchants  (id, email, full_name)
     |  FK: merchant_id
     v
public.stores  (id, merchant_id, name, phone, street, city, state, zip_code, timezone, status)
     |  FK: store_id
     v
public.products  (id, store_id, name, description, price, status)
```

### Triggers & Functions
| Function | Trigger | Description |
|---|---|---|
| `handle_new_user()` | `AFTER INSERT` on `auth.users` | Auto-creates `merchants` row from JWT metadata. `SECURITY DEFINER`. |
| `update_updated_at()` | `BEFORE UPDATE` on all tables | Generic trigger that stamps `updated_at` on every row mutation. |
| `deactivate_store(id)` | Called via RPC | Atomic function: sets store inactive + marks all its products unavailable in one transaction. Includes explicit ownership guard (defence-in-depth). |
| `get_merchant_store_count()` | Called via RPC | Stable helper that returns the number of active stores for a given merchant. |

### Row Level Security

| Table | Operations | Policy | Notes |
|---|---|---|---|
| `merchants` | `SELECT`, `UPDATE` | `id = auth.uid()` | |
| `stores` | `SELECT`, `INSERT`, `UPDATE` | `merchant_id = auth.uid()` | `DELETE` intentionally omitted — deactivation is the supported lifecycle |
| `products` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | `store_id` in merchant's stores | Ownership is transitive through the `stores` table |
---

## Security Model

| Concern | Solution |
|---|---|
| Data isolation | RLS on every table; `auth.uid()` in all policies |
| Session management | Cookie-based sessions via `@supabase/ssr`; token refresh in middleware |
| Route protection | Middleware redirects unauthenticated requests to `/login` |
| IDOR prevention | Server Actions re-verify ownership via RLS on every mutation |
| Cascade safety | `deactivate_store()` is atomic; no partial state possible |
| Password policy | Zod enforces min 8 chars + uppercase + digit on signup |
| Destructive UX | `AlertDialog` confirmation required for deactivation and deletion |
| Secrets | Anon key is public by design; service role key never in browser code |

---

## Scalability

- Indexes on stores(merchant_id), stores(status), products(store_id), products(status)
- Server Components for all initial data fetches (no client waterfalls)
- Server Actions colocated with mutations (easy to add rate-limiting, audit logs)
- Route groups (auth)/(dashboard) are fully independent — adding (admin) adds zero coupling
- deactivate_store() as a DB RPC means future services can call it with the same atomicity
- Schema is purely additive — orders, categories, store_hours extend cleanly

---

## Form Validation

| Form | Fields |
|---|---|
| Sign Up | `full_name` (min 2), `email` format, `password` (min 8, 1 uppercase, 1 digit), `confirm` must match |
| Log In | `email` format, `password` required |
| Store | `name` (2–120), `phone`, `street`, `city`, `state` (2-char ISO), `zip` (`\d{5}(-\d{4})?`), `timezone` |
| Product | `name` (2–120), `description` (max 1000), `price` (≥0, valid decimal), `status` enum |
