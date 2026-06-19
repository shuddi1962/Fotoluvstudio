-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'seller', 'admin')),
  is_gold_member BOOLEAN NOT NULL DEFAULT false,
  gold_member_since TIMESTAMPTZ,
  stripe_or_paystack_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  event_date DATE,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. MEDIA TABLE
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id),
  event_id UUID REFERENCES events(id),
  context TEXT NOT NULL CHECK (context IN ('public_gallery', 'client_event', 'fashion_showcase', 'seller_design')),
  storage_path_original TEXT NOT NULL,
  storage_path_derivative TEXT,
  media_type TEXT NOT NULL DEFAULT 'photo' CHECK (media_type IN ('photo', 'video')),
  title TEXT,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  width_px INT,
  height_px INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. COLLECTIONS TABLE
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  cover_media_id UUID REFERENCES media(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. COLLECTION ITEMS TABLE
CREATE TABLE IF NOT EXISTS collection_items (
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, media_id)
);

-- 6. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, media_id)
);

-- 7. SELLER PROFILES TABLE
CREATE TABLE IF NOT EXISTS seller_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  storefront_name TEXT NOT NULL,
  storefront_slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  banner_url TEXT,
  accent_color TEXT DEFAULT '#2D6E5E',
  payout_method TEXT,
  commission_rate_override NUMERIC,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. POD PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS pod_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  printful_product_id TEXT,
  category TEXT NOT NULL CHECK (category IN ('wall_art', 'home_decor', 'apparel', 'lifestyle', 'stationery')),
  name TEXT NOT NULL,
  base_cost NUMERIC NOT NULL,
  available_sizes JSONB DEFAULT '[]',
  available_variants JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. SELLER PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS seller_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  pod_product_id UUID NOT NULL REFERENCES pod_products(id),
  selected_variant JSONB DEFAULT '{}',
  seller_price NUMERIC NOT NULL,
  mockup_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. PLATFORM FEE RULES TABLE
CREATE TABLE IF NOT EXISTS platform_fee_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT CHECK (category IN ('wall_art', 'home_decor', 'apparel', 'lifestyle', 'stationery')),
  commission_percent NUMERIC NOT NULL,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'fulfilled', 'shipped', 'cancelled')),
  total_amount NUMERIC NOT NULL,
  payment_provider TEXT CHECK (payment_provider IN ('paystack', 'flutterwave', 'stripe')),
  payment_reference TEXT,
  shipping_address JSONB,
  printful_order_id TEXT,
  tracking_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seller_product_id UUID NOT NULL REFERENCES seller_products(id),
  quantity INT NOT NULL DEFAULT 1,
  price_at_purchase NUMERIC NOT NULL,
  pod_base_cost_at_purchase NUMERIC NOT NULL,
  commission_amount NUMERIC NOT NULL,
  seller_payout_amount NUMERIC NOT NULL
);

-- 13. PAYOUTS TABLE
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled')),
  billing_provider TEXT CHECK (billing_provider IN ('paystack', 'flutterwave', 'stripe')),
  billing_reference TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. REVIEWS TABLE (Phase 1)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seller_product_id UUID NOT NULL REFERENCES seller_products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. NOTIFICATIONS TABLE (Phase 1)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_event', 'order_shipped', 'new_sale', 'payout_processed', 'new_follower', 'membership_reminder', 'order_confirmation')),
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. FOLLOWS TABLE (Phase 1)
CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, seller_id)
);

-- 18. BOOKING INQUIRIES TABLE (Phase 1)
CREATE TABLE IF NOT EXISTS booking_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_type TEXT,
  event_date DATE,
  budget_range TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'contacted', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
