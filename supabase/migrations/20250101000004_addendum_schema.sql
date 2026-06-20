-- Addendum: Media Lightbox, Download Gating, Cart & Checkout schema
-- Extends core_schema (20250101000001)

-- 1. MEDIA table additions
ALTER TABLE media ADD COLUMN IF NOT EXISTS watermark_tile_applied BOOLEAN NOT NULL DEFAULT false;

-- 2. DOWNLOAD TIERS table (admin-configurable free/locked cutoff)
CREATE TABLE IF NOT EXISTS download_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  tier_name TEXT NOT NULL,
  width_px INT NOT NULL,
  height_px INT NOT NULL,
  is_free_tier BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Default photo tiers
INSERT INTO download_tiers (media_type, tier_name, width_px, height_px, is_free_tier, sort_order) VALUES
  ('photo', 'Small', 640, 960, true, 1),
  ('photo', 'Medium', 1280, 1920, true, 2),
  ('photo', 'Large', 1920, 2880, false, 3),
  ('photo', 'Original', 4647, 6971, false, 4),
  ('video', 'SD — 360p', 360, 640, true, 1),
  ('video', 'SD — 540p', 540, 960, true, 2),
  ('video', 'HD — 720p', 720, 1280, true, 3),
  ('video', 'Full HD — 1080p', 1080, 1920, false, 4),
  ('video', 'Quad HD — 1440p', 1440, 2560, false, 5),
  ('video', '4K UHD — 2160p', 2160, 3840, false, 6)
ON CONFLICT DO NOTHING;

-- 3. CART ITEMS table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  guest_session_id TEXT,
  seller_product_id UUID NOT NULL REFERENCES seller_products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cart_owner_check CHECK (
    (cart_owner_id IS NOT NULL AND guest_session_id IS NULL) OR
    (cart_owner_id IS NULL AND guest_session_id IS NOT NULL)
  )
);

-- 4. ORDERS table additions
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email TEXT;

-- 5. MEDIA EDITS table
CREATE TABLE IF NOT EXISTS media_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  edited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  tool_used TEXT NOT NULL CHECK (tool_used IN ('add_text', 'canva', 'convert_to_gif')),
  result_storage_path TEXT,
  source_was_watermarked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
