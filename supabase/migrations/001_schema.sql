-- =============================================================================
-- Migration 001: Core Schema
-- Creates merchant profiles, stores, and products tables
-- with triggers and helper functions
-- =============================================================================

-- Enable UUID extension (already available in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------------
CREATE TYPE store_status AS ENUM ('active', 'inactive');
CREATE TYPE product_status AS ENUM ('available', 'unavailable');

-- ---------------------------------------------------------------------------
-- MERCHANTS TABLE
-- Extends Supabase auth.users with merchant-specific profile data
-- ---------------------------------------------------------------------------
CREATE TABLE public.merchants (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.merchants IS
  'Merchant profiles — one-to-one with auth.users';

-- ---------------------------------------------------------------------------
-- STORES TABLE
-- ---------------------------------------------------------------------------
CREATE TABLE public.stores (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,

  -- Business info
  name        TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  phone       TEXT NOT NULL,

  -- Address
  street      TEXT NOT NULL,
  city        TEXT NOT NULL,
  state       TEXT NOT NULL CHECK (char_length(state) = 2), -- ISO 3166-2 US code
  zip_code    TEXT NOT NULL CHECK (zip_code ~ '^\d{5}(-\d{4})?$'),

  -- Operations
  timezone    TEXT NOT NULL DEFAULT 'America/New_York',
  status      store_status NOT NULL DEFAULT 'active',

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stores_merchant_id ON public.stores(merchant_id);
CREATE INDEX idx_stores_status      ON public.stores(status);

COMMENT ON TABLE public.stores IS
  'Physical store locations owned by a merchant';

-- ---------------------------------------------------------------------------
-- PRODUCTS TABLE
-- ---------------------------------------------------------------------------
CREATE TABLE public.products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id    UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,

  name        TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  description TEXT CHECK (char_length(description) <= 1000),
  price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  status      product_status NOT NULL DEFAULT 'available',

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_store_id ON public.products(store_id);
CREATE INDEX idx_products_status   ON public.products(status);

COMMENT ON TABLE public.products IS
  'Products / menu items within a store';

-- ---------------------------------------------------------------------------
-- FUNCTION: update_updated_at()
-- Generic trigger function that stamps updated_at on every row mutation
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Attach to all three tables
CREATE TRIGGER trg_merchants_updated_at
  BEFORE UPDATE ON public.merchants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ---------------------------------------------------------------------------
-- FUNCTION: handle_new_user()
-- Automatically creates a merchant profile when a user signs up via
-- Supabase Auth (fired by the auth.users INSERT trigger)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER        -- runs as the function owner, bypasses RLS
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.merchants (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING; -- idempotent: safe to re-run
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- FUNCTION: get_merchant_store_count(merchant_id UUID)
-- Returns the number of active stores for a given merchant
-- Useful for business-rule enforcement on the frontend
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_merchant_store_count(p_merchant_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.stores
  WHERE merchant_id = p_merchant_id
    AND status = 'active';
$$;

-- ---------------------------------------------------------------------------
-- FUNCTION: deactivate_store(store_id UUID)
-- Deactivates a store AND marks all its products as unavailable.
-- Encapsulates the cascade business rule in one atomic operation.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.deactivate_store(p_store_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the calling user owns the store (RLS already enforces this,
  -- but we add an explicit guard for defence-in-depth)
  IF NOT EXISTS (
    SELECT 1 FROM public.stores
    WHERE id = p_store_id
      AND merchant_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'store_not_found_or_unauthorized';
  END IF;

  UPDATE public.stores
    SET status = 'inactive'
  WHERE id = p_store_id;

  UPDATE public.products
    SET status = 'unavailable'
  WHERE store_id = p_store_id;
END;
$$;
