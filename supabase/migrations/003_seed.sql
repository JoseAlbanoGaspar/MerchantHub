-- =============================================================================
-- Migration 003: Seed Data
-- Inserts three merchant accounts with stores and products.
--
-- HOW TO USE WITH SUPABASE:
--   1. Create the auth users via the Supabase Auth API or Dashboard first,
--      noting the UUIDs produced.
--   2. Replace the placeholder UUIDs below with the real ones, OR
--   3. Run this script AFTER the handle_new_user() trigger has fired
--      (i.e. after sign-up), which auto-creates the merchants rows.
--
-- For local dev / CI you can use `supabase db seed` which runs this file
-- automatically after migrations. The auth.users INSERT uses Supabase's
-- internal admin helpers available in the seed context.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Create auth users (Supabase service-role / admin context required)
--    These UUIDs are fixed so subsequent seed runs are idempotent.
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  aud,
  role
)
VALUES
  -- Merchant 1 — Mario Rossi (Italian Bistro chain)
  (
    '11111111-1111-1111-1111-111111111111',
    'mario@bistromario.com',
    crypt('Seed@1234', gen_salt('bf')),
    NOW(),
    '{"full_name": "Mario Rossi"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
  ),
  -- Merchant 2 — Sofia Park (Korean BBQ group)
  (
    '22222222-2222-2222-2222-222222222222',
    'sofia@seoulkitchen.com',
    crypt('Seed@1234', gen_salt('bf')),
    NOW(),
    '{"full_name": "Sofia Park"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
  ),
  -- Merchant 3 — James Okafor (Jerk Chicken chain)
  (
    '33333333-3333-3333-3333-333333333333',
    'james@jerkhouse.com',
    crypt('Seed@1234', gen_salt('bf')),
    NOW(),
    '{"full_name": "James Okafor"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- The handle_new_user() trigger fires on the above INSERTs and creates
-- corresponding rows in public.merchants automatically.
-- We still UPSERT below to ensure idempotency in re-seeded environments.

INSERT INTO public.merchants (id, email, full_name)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'mario@bistromario.com',  'Mario Rossi'),
  ('22222222-2222-2222-2222-222222222222', 'sofia@seoulkitchen.com', 'Sofia Park'),
  ('33333333-3333-3333-3333-333333333333', 'james@jerkhouse.com',    'James Okafor')
ON CONFLICT (id) DO UPDATE
  SET full_name  = EXCLUDED.full_name,
      email      = EXCLUDED.email;

-- ---------------------------------------------------------------------------
-- 2. Stores
-- ---------------------------------------------------------------------------
INSERT INTO public.stores (id, merchant_id, name, phone, street, city, state, zip_code, timezone, status)
VALUES
  -- Mario's stores (2 active, 1 inactive)
  (
    'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Bistro Mario — Midtown',
    '(212) 555-0101',
    '350 5th Ave', 'New York', 'NY', '10118',
    'America/New_York', 'active'
  ),
  (
    'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Bistro Mario — Brooklyn',
    '(718) 555-0102',
    '180 Atlantic Ave', 'Brooklyn', 'NY', '11201',
    'America/New_York', 'active'
  ),
  (
    'aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Bistro Mario — Hoboken',
    '(201) 555-0103',
    '88 Washington St', 'Hoboken', 'NJ', '07030',
    'America/New_York', 'inactive'
  ),

  -- Sofia's stores (2 active)
  (
    'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'Seoul Kitchen — Downtown',
    '(213) 555-0201',
    '742 S Grand Ave', 'Los Angeles', 'CA', '90017',
    'America/Los_Angeles', 'active'
  ),
  (
    'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'Seoul Kitchen — Koreatown',
    '(213) 555-0202',
    '3200 Wilshire Blvd', 'Los Angeles', 'CA', '90010',
    'America/Los_Angeles', 'active'
  ),

  -- James' store (1 active)
  (
    'cccccccc-0001-0001-0001-cccccccccccc',
    '33333333-3333-3333-3333-333333333333',
    'Jerk House — Buckhead',
    '(404) 555-0301',
    '3035 Peachtree Rd NE', 'Atlanta', 'GA', '30305',
    'America/New_York', 'active'
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. Products
-- ---------------------------------------------------------------------------
INSERT INTO public.products (id, store_id, name, description, price, status)
VALUES
  -- Bistro Mario — Midtown products
  ('dddddddd-0001-0001-0001-aaaaaaaaaaaa', 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
   'Spaghetti Carbonara',
   'Classic Roman pasta with guanciale, egg yolk, Pecorino Romano, and black pepper.',
   18.50, 'available'),
  ('dddddddd-0002-0002-0002-aaaaaaaaaaaa', 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
   'Margherita Pizza',
   'San Marzano tomato base, fresh fior di latte mozzarella, basil.',
   15.00, 'available'),
  ('dddddddd-0003-0003-0003-aaaaaaaaaaaa', 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
   'Tiramisu',
   'House-made tiramisu with Savoiardi biscuits, espresso, and mascarpone cream.',
   9.00, 'available'),
  ('dddddddd-0004-0004-0004-aaaaaaaaaaaa', 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
   'Risotto ai Funghi',
   'Arborio rice with porcini mushrooms, white wine, Parmigiano-Reggiano.',
   21.00, 'unavailable'),

  -- Bistro Mario — Brooklyn products
  ('dddddddd-0005-0005-0005-aaaaaaaaaaaa', 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa',
   'Penne all''Arrabbiata',
   'Penne with spicy tomato sauce, garlic, and fresh basil.',
   14.00, 'available'),
  ('dddddddd-0006-0006-0006-aaaaaaaaaaaa', 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa',
   'Caprese Salad',
   'Buffalo mozzarella, heirloom tomatoes, fresh basil, EVOO.',
   13.50, 'available'),

  -- Seoul Kitchen — Downtown products
  ('eeeeeeee-0001-0001-0001-bbbbbbbbbbbb', 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb',
   'Galbi (Short Ribs)',
   'Marinated beef short ribs grilled over charcoal. Served with banchan.',
   32.00, 'available'),
  ('eeeeeeee-0002-0002-0002-bbbbbbbbbbbb', 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb',
   'Bibimbap',
   'Mixed rice bowl with vegetables, gochujang, and a fried egg.',
   16.00, 'available'),
  ('eeeeeeee-0003-0003-0003-bbbbbbbbbbbb', 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb',
   'Sundubu Jjigae',
   'Silken tofu stew with kimchi, clams, and egg in a spicy broth.',
   14.00, 'available'),
  ('eeeeeeee-0004-0004-0004-bbbbbbbbbbbb', 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb',
   'Japchae',
   'Glass noodles stir-fried with vegetables and beef in sesame soy.',
   13.00, 'unavailable'),

  -- Seoul Kitchen — Koreatown products
  ('eeeeeeee-0005-0005-0005-bbbbbbbbbbbb', 'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb',
   'Samgyeopsal (Pork Belly)',
   'Thick-cut uncured pork belly grilled tableside. Serves 2.',
   28.00, 'available'),
  ('eeeeeeee-0006-0006-0006-bbbbbbbbbbbb', 'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb',
   'Kimchi Fried Rice',
   'Wok-fried rice with kimchi, spam, scallions, and sesame oil.',
   12.00, 'available'),

  -- Jerk House — Buckhead products
  ('ffffffff-0001-0001-0001-cccccccccccc', 'cccccccc-0001-0001-0001-cccccccccccc',
   'Jerk Chicken (Half)',
   'Half chicken marinated overnight in scotch bonnet jerk paste, grilled on pimento wood.',
   17.00, 'available'),
  ('ffffffff-0002-0002-0002-cccccccccccc', 'cccccccc-0001-0001-0001-cccccccccccc',
   'Oxtail Stew',
   'Slow-braised oxtail with butter beans, scallions, and thyme. Served with rice and peas.',
   22.00, 'available'),
  ('ffffffff-0003-0003-0003-cccccccccccc', 'cccccccc-0001-0001-0001-cccccccccccc',
   'Festival (4 pcs)',
   'Sweet fried dumplings — the perfect side for jerk dishes.',
   6.00, 'available'),
  ('ffffffff-0004-0004-0004-cccccccccccc', 'cccccccc-0001-0001-0001-cccccccccccc',
   'Rum Punch',
   'House blend of Wray & Nephew, pineapple, mango, and lime.',
   8.50, 'unavailable')
ON CONFLICT (id) DO NOTHING;
