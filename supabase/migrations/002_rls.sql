-- =============================================================================
-- Migration 002: Row Level Security (RLS)
-- Enforces data isolation — merchants can only touch their own data
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enable RLS on all application tables
-- ---------------------------------------------------------------------------
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products  ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- MERCHANTS policies
-- A merchant can only read and update their own profile row.
-- INSERT is handled by the SECURITY DEFINER trigger; no direct INSERT needed.
-- ---------------------------------------------------------------------------
CREATE POLICY "merchants: select own row"
  ON public.merchants FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "merchants: update own row"
  ON public.merchants FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ---------------------------------------------------------------------------
-- STORES policies
-- ---------------------------------------------------------------------------
CREATE POLICY "stores: select own stores"
  ON public.stores FOR SELECT
  USING (merchant_id = auth.uid());

CREATE POLICY "stores: insert own stores"
  ON public.stores FOR INSERT
  WITH CHECK (merchant_id = auth.uid());

CREATE POLICY "stores: update own stores"
  ON public.stores FOR UPDATE
  USING (merchant_id = auth.uid())
  WITH CHECK (merchant_id = auth.uid());

-- NOTE: Hard deletes are intentionally not permitted via policy.
-- Deactivation (soft-delete) is the supported lifecycle action.
-- If you ever need DELETE, add a policy here and remove this comment.

-- ---------------------------------------------------------------------------
-- PRODUCTS policies
-- Products are scoped to a store, which is scoped to a merchant.
-- We join through stores to enforce ownership.
-- ---------------------------------------------------------------------------
CREATE POLICY "products: select own products"
  ON public.products FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM public.stores WHERE merchant_id = auth.uid()
    )
  );

CREATE POLICY "products: insert own products"
  ON public.products FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT id FROM public.stores WHERE merchant_id = auth.uid()
    )
  );

CREATE POLICY "products: update own products"
  ON public.products FOR UPDATE
  USING (
    store_id IN (
      SELECT id FROM public.stores WHERE merchant_id = auth.uid()
    )
  )
  WITH CHECK (
    store_id IN (
      SELECT id FROM public.stores WHERE merchant_id = auth.uid()
    )
  );

CREATE POLICY "products: delete own products"
  ON public.products FOR DELETE
  USING (
    store_id IN (
      SELECT id FROM public.stores WHERE merchant_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Grant table-level permissions to the authenticated role
-- (Supabase's anon / authenticated roles must be explicitly granted)
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE        ON public.merchants TO authenticated;
GRANT SELECT, INSERT, UPDATE        ON public.stores    TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;

-- Allow authenticated users to call the helper RPCs
GRANT EXECUTE ON FUNCTION public.get_merchant_store_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deactivate_store(UUID)         TO authenticated;
