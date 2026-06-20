-- fotoluvstudio Demo Seed Data
-- Run once to populate the MVP with placeholder content

-- ── PROFILES ──────────────────────────────────────────────────────────────────
INSERT INTO profiles (id, full_name, role, is_gold_member) VALUES
  ('4e5667c8-ff2f-4433-ba88-f4d21f1f3b84', 'Tunde Adebayo (Owner)', 'admin', false),
  ('5dfdbb28-83f3-4732-a795-aa9d9d8ebcdd', 'Chioma Eze (Photographer)', 'seller', false),
  ('d02f76e5-2946-4bab-b02a-bb27d0f808de', 'Amara Okafor', 'client', true),
  ('eb4274b3-e332-47d4-98c5-56c88adcdb03', 'Emeka Nwosu', 'seller', false),
  ('72214291-4f4e-4f50-8267-895f17cd408e', 'Zara Adebayo (Fashion)', 'seller', false)
ON CONFLICT (id) DO NOTHING;

-- ── SELLER PROFILES ───────────────────────────────────────────────────────────
INSERT INTO seller_profiles (id, storefront_name, storefront_slug, bio, accent_color, approved_at) VALUES
  ('4e5667c8-ff2f-4433-ba88-f4d21f1f3b84', 'Tunde Captures', 'tunde-captures', 'Professional photographer capturing life''s most beautiful moments. Specializing in weddings, portraits, and commercial photography.', '#2D6E5E', now()),
  ('5dfdbb28-83f3-4732-a795-aa9d9d8ebcdd', 'Chioma Lens', 'chioma-lens', 'Fine art photographer with a passion for landscapes and cultural storytelling. Based in Lagos.', '#8B4513', now()),
  ('eb4274b3-e332-47d4-98c5-56c88adcdb03', 'Emeka Designs', 'emeka-designs', 'Digital artist and illustrator creating vibrant African-inspired artwork for modern spaces.', '#D4A574', now()),
  ('72214291-4f4e-4f50-8267-895f17cd408e', 'Zara Fashion House', 'zara-fashion', 'Contemporary fashion design blending traditional African textiles with modern silhouettes.', '#C77DFF', now())
ON CONFLICT (id) DO NOTHING;

-- Enable bespoke commissions for Zara Fashion House (designer storefront)
UPDATE seller_profiles SET offers_commissions = true WHERE id = '72214291-4f4e-4f50-8267-895f17cd408e';

-- ── EVENTS ─────────────────────────────────────────────────────────────────────
INSERT INTO events (id, client_id, created_by, title, event_date, is_published) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'd02f76e5-2946-4bab-b02a-bb27d0f808de', '4e5667c8-ff2f-4433-ba88-f4d21f1f3b84', 'Amara & Dapo Wedding', '2026-05-15', true),
  ('a1000000-0000-0000-0000-000000000002', 'd02f76e5-2946-4bab-b02a-bb27d0f808de', '4e5667c8-ff2f-4433-ba88-f4d21f1f3b84', 'Engagement Shoot — Lagos Marina', '2026-03-20', true),
  ('a1000000-0000-0000-0000-000000000003', 'd02f76e5-2946-4bab-b02a-bb27d0f808de', '4e5667c8-ff2f-4433-ba88-f4d21f1f3b84', 'Maternity Shoot', '2026-01-10', true)
ON CONFLICT (id) DO NOTHING;

-- ── MEDIA (Public Gallery + Client Events + Seller Designs) ────────────────────
INSERT INTO media (id, owner_id, event_id, context, storage_path_original, storage_path_derivative, media_type, title, tags, is_featured, width_px, height_px) VALUES
-- Public Gallery (Tunde Captures)
('b1000000-0000-0000-0000-000000000001', '4e5667c8-ff2f-4433-ba88-f4d21f1f3b84', NULL, 'public_gallery', 'https://picsum.photos/seed/lagos1/1200/800', 'https://picsum.photos/seed/lagos1/800/600', 'photo', 'Lagos Sunset', ARRAY['landscape', 'sunset', 'lagos'], true, 1200, 800),
('b1000000-0000-0000-0000-000000000002', '4e5667c8-ff2f-4433-ba88-f4d21f1f3b84', NULL, 'public_gallery', 'https://picsum.photos/seed/bride1/1200/1800', 'https://picsum.photos/seed/bride1/800/1200', 'photo', 'The Waiting Bride', ARRAY['wedding', 'portrait', 'bride'], true, 1200, 1800),
('b1000000-0000-0000-0000-000000000003', '4e5667c8-ff2f-4433-ba88-f4d21f1f3b84', NULL, 'public_gallery', 'https://picsum.photos/seed/nature1/1600/900', 'https://picsum.photos/seed/nature1/800/450', 'photo', 'Waterfall Serenity', ARRAY['nature', 'waterfall', 'landscape'], true, 1600, 900),
('b1000000-0000-0000-0000-000000000004', '4e5667c8-ff2f-4433-ba88-f4d21f1f3b84', NULL, 'public_gallery', 'https://picsum.photos/seed/portrait1/1200/1500', 'https://picsum.photos/seed/portrait1/800/1000', 'photo', 'Golden Hour Portrait', ARRAY['portrait', 'golden-hour', 'model'], false, 1200, 1500),
('b1000000-0000-0000-0000-000000000005', '4e5667c8-ff2f-4433-ba88-f4d21f1f3b84', NULL, 'public_gallery', 'https://picsum.photos/seed/city1/1400/800', 'https://picsum.photos/seed/city1/800/457', 'photo', 'City Lights', ARRAY['city', 'night', 'architecture'], true, 1400, 800),
('b1000000-0000-0000-0000-000000000006', '4e5667c8-ff2f-4433-ba88-f4d21f1f3b84', NULL, 'public_gallery', 'https://picsum.photos/seed/beach1/1200/800', 'https://picsum.photos/seed/beach1/800/533', 'photo', 'Coastal Morning', ARRAY['beach', 'coastal', 'morning'], false, 1200, 800),
-- Chioma Lens public gallery
('b1000000-0000-0000-0000-000000000007', '5dfdbb28-83f3-4732-a795-aa9d9d8ebcdd', NULL, 'public_gallery', 'https://picsum.photos/seed/market1/1200/900', 'https://picsum.photos/seed/market1/800/600', 'photo', 'Balogun Market', ARRAY['culture', 'market', 'lagos'], true, 1200, 900),
('b1000000-0000-0000-0000-000000000008', '5dfdbb28-83f3-4732-a795-aa9d9d8ebcdd', NULL, 'public_gallery', 'https://picsum.photos/seed/dancer1/1000/1500', 'https://picsum.photos/seed/dancer1/667/1000', 'photo', 'Traditional Dancer', ARRAY['culture', 'dance', 'tradition'], true, 1000, 1500),
('b1000000-0000-0000-0000-000000000009', '5dfdbb28-83f3-4732-a795-aa9d9d8ebcdd', NULL, 'public_gallery', 'https://picsum.photos/seed/landscape2/1600/900', 'https://picsum.photos/seed/landscape2/800/450', 'photo', 'Obudu Hills', ARRAY['landscape', 'hills', 'nature'], false, 1600, 900),
-- Client Event Media
('b2000000-0000-0000-0000-000000000001', '4e5667c8-ff2f-4433-ba88-f4d21f1f3b84', 'a1000000-0000-0000-0000-000000000001', 'client_event', 'https://picsum.photos/seed/wed1/1200/1800', 'https://picsum.photos/seed/wed1/800/1200', 'photo', 'First Look', NULL, false, 1200, 1800),
('b2000000-0000-0000-0000-000000000002', '4e5667c8-ff2f-4433-ba88-f4d21f1f3b84', 'a1000000-0000-0000-0000-000000000001', 'client_event', 'https://picsum.photos/seed/wed2/1200/800', 'https://picsum.photos/seed/wed2/800/533', 'photo', 'Ceremony', NULL, false, 1200, 800),
('b2000000-0000-0000-0000-000000000003', '4e5667c8-ff2f-4433-ba88-f4d21f1f3b84', 'a1000000-0000-0000-0000-000000000001', 'client_event', 'https://picsum.photos/seed/wed3/1200/800', 'https://picsum.photos/seed/wed3/800/533', 'photo', 'Reception', NULL, false, 1200, 800),
('b2000000-0000-0000-0000-000000000004', '4e5667c8-ff2f-4433-ba88-f4d21f1f3b84', 'a1000000-0000-0000-0000-000000000002', 'client_event', 'https://picsum.photos/seed/eng1/1200/800', 'https://picsum.photos/seed/eng1/800/533', 'photo', 'Marina Sunset', NULL, false, 1200, 800),
('b2000000-0000-0000-0000-000000000005', '4e5667c8-ff2f-4433-ba88-f4d21f1f3b84', 'a1000000-0000-0000-0000-000000000003', 'client_event', 'https://picsum.photos/seed/mat1/1200/1500', 'https://picsum.photos/seed/mat1/800/1000', 'photo', 'Baby Bump', NULL, false, 1200, 1500),
-- Seller Design Uploads
('b3000000-0000-0000-0000-000000000001', '5dfdbb28-83f3-4732-a795-aa9d9d8ebcdd', NULL, 'seller_design', 'https://picsum.photos/seed/art1/1200/1200', 'https://picsum.photos/seed/art1/800/800', 'photo', 'Sunset Vibes', ARRAY['abstract', 'colorful'], false, 1200, 1200),
('b3000000-0000-0000-0000-000000000002', 'eb4274b3-e332-47d4-98c5-56c88adcdb03', NULL, 'seller_design', 'https://picsum.photos/seed/afro1/1200/1200', 'https://picsum.photos/seed/afro1/800/800', 'photo', 'African Pattern', ARRAY['pattern', 'african', 'culture'], false, 1200, 1200),
('b3000000-0000-0000-0000-000000000003', '72214291-4f4e-4f50-8267-895f17cd408e', NULL, 'seller_design', 'https://picsum.photos/seed/fashion1/1000/1400', 'https://picsum.photos/seed/fashion1/714/1000', 'photo', 'Spring Collection 2026', ARRAY['fashion', 'spring', 'collection'], false, 1000, 1400),
('b3000000-0000-0000-0000-000000000004', '72214291-4f4e-4f50-8267-895f17cd408e', NULL, 'seller_design', 'https://picsum.photos/seed/fashion2/1000/1400', 'https://picsum.photos/seed/fashion2/714/1000', 'photo', 'Urban Chic', ARRAY['fashion', 'urban', 'streetwear'], false, 1000, 1400),
-- Fashion Showcase
('b4000000-0000-0000-0000-000000000001', '72214291-4f4e-4f50-8267-895f17cd408e', NULL, 'fashion_showcase', 'https://picsum.photos/seed/look1/1000/1400', 'https://picsum.photos/seed/look1/714/1000', 'photo', 'Summer Breeze Look', ARRAY['fashion', 'summer', 'lookbook'], true, 1000, 1400),
('b4000000-0000-0000-0000-000000000002', '72214291-4f4e-4f50-8267-895f17cd408e', NULL, 'fashion_showcase', 'https://picsum.photos/seed/look2/1000/1400', 'https://picsum.photos/seed/look2/714/1000', 'photo', 'Evening Glam', ARRAY['fashion', 'evening', 'glam'], true, 1000, 1400)
ON CONFLICT (id) DO NOTHING;

-- ── COLLECTIONS ────────────────────────────────────────────────────────────────
INSERT INTO collections (id, owner_id, title, description, cover_media_id) VALUES
  ('c1000000-0000-0000-0000-000000000001', '4e5667c8-ff2f-4433-ba88-f4d21f1f3b84', 'Light & Shadow', 'A curated collection exploring the interplay of natural light and architectural shadows across Lagos.', 'b1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000002', '5dfdbb28-83f3-4732-a795-aa9d9d8ebcdd', 'Cultural Tapestry', 'Vibrant stories from across Nigeria — markets, festivals, and everyday life.', 'b1000000-0000-0000-0000-000000000007'),
  ('c1000000-0000-0000-0000-000000000003', '72214291-4f4e-4f50-8267-895f17cd408e', 'Spring/Summer 2026', 'Zara Fashion House presents the latest collection — where tradition meets contemporary style.', 'b4000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- ── COLLECTION ITEMS ───────────────────────────────────────────────────────────
INSERT INTO collection_items (collection_id, media_id, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 1),
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 2),
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 3),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000007', 1),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000008', 2),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000009', 3),
  ('c1000000-0000-0000-0000-000000000003', 'b4000000-0000-0000-0000-000000000001', 1),
  ('c1000000-0000-0000-0000-000000000003', 'b4000000-0000-0000-0000-000000000002', 2)
ON CONFLICT (collection_id, media_id) DO NOTHING;

-- ── POD PRODUCTS ───────────────────────────────────────────────────────────────
INSERT INTO pod_products (id, printful_product_id, category, name, base_cost, available_sizes, available_variants, is_active) VALUES
  ('d1000000-0000-0000-0000-000000000001', '71', 'wall_art', 'Canvas Print 16x20', 19.99, '["16x20"]', '[]', true),
  ('d1000000-0000-0000-0000-000000000002', '72', 'wall_art', 'Framed Print 16x20', 29.99, '["16x20"]', '[]', true),
  ('d1000000-0000-0000-0000-000000000003', '73', 'wall_art', 'Metal Print 12x18', 34.99, '["12x18"]', '[]', true),
  ('d1000000-0000-0000-0000-000000000004', '74', 'home_decor', 'Coffee Mug 11oz', 8.99, '["11oz"]', '["white","black"]', true),
  ('d1000000-0000-0000-0000-000000000005', '75', 'home_decor', 'Throw Pillow 18x18', 14.99, '["18x18"]', '["white"]', true),
  ('d1000000-0000-0000-0000-000000000006', '76', 'apparel', 'Men''s T-Shirt', 11.99, '["S","M","L","XL","2XL"]', '["white","black","navy"]', true),
  ('d1000000-0000-0000-0000-000000000007', '77', 'apparel', 'Women''s T-Shirt', 11.99, '["S","M","L","XL"]', '["white","black","pink"]', true),
  ('d1000000-0000-0000-0000-000000000008', '78', 'apparel', 'Hoodie', 29.99, '["S","M","L","XL"]', '["black","gray","navy"]', true),
  ('d1000000-0000-0000-0000-000000000009', '79', 'lifestyle', 'Tote Bag', 12.99, '["15x15"]', '["natural","black"]', true),
  ('d1000000-0000-0000-0000-000000000010', '80', 'lifestyle', 'Phone Case', 9.99, '["iPhone"]', '["black","clear"]', true),
  ('d1000000-0000-0000-0000-000000000011', '81', 'stationery', 'Greeting Card', 3.99, '["5x7"]', '["white"]', true),
  ('d1000000-0000-0000-0000-000000000012', '82', 'stationery', 'Notebook', 8.99, '["A5"]', '["lined","blank"]', true)
ON CONFLICT (id) DO NOTHING;

-- ── SELLER PRODUCTS ────────────────────────────────────────────────────────────
INSERT INTO seller_products (id, seller_id, media_id, pod_product_id, selected_variant, seller_price, mockup_url, is_published) VALUES
  ('e1000000-0000-0000-0000-000000000001', '5dfdbb28-83f3-4732-a795-aa9d9d8ebcdd', 'b3000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', '{"size":"16x20"}', 49.99, 'https://picsum.photos/seed/art1/400/400', true),
  ('e1000000-0000-0000-0000-000000000002', '5dfdbb28-83f3-4732-a795-aa9d9d8ebcdd', 'b3000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000004', '{"size":"11oz","color":"white"}', 24.99, 'https://picsum.photos/seed/art1/400/400', true),
  ('e1000000-0000-0000-0000-000000000003', 'eb4274b3-e332-47d4-98c5-56c88adcdb03', 'b3000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000006', '{"size":"M","color":"white"}', 29.99, 'https://picsum.photos/seed/afro1/400/400', true),
  ('e1000000-0000-0000-0000-000000000004', 'eb4274b3-e332-47d4-98c5-56c88adcdb03', 'b3000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000009', '{"size":"15x15","color":"natural"}', 27.99, 'https://picsum.photos/seed/afro1/400/400', true),
  ('e1000000-0000-0000-0000-000000000005', '72214291-4f4e-4f50-8267-895f17cd408e', 'b3000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000007', '{"size":"M","color":"white"}', 34.99, 'https://picsum.photos/seed/fashion1/400/400', true),
  ('e1000000-0000-0000-0000-000000000006', '72214291-4f4e-4f50-8267-895f17cd408e', 'b3000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000008', '{"size":"M","color":"black"}', 49.99, 'https://picsum.photos/seed/fashion2/400/400', true),
  -- Platform owner's own products (Tunde Captures)
  ('e1000000-0000-0000-0000-000000000007', '4e5667c8-ff2f-4433-ba88-f4d21f1f3b84', 'b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', '{"size":"16x20"}', 59.99, 'https://picsum.photos/seed/lagos1/400/400', true),
  ('e1000000-0000-0000-0000-000000000008', '4e5667c8-ff2f-4433-ba88-f4d21f1f3b84', 'b1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000002', '{"size":"16x20"}', 69.99, 'https://picsum.photos/seed/nature1/400/400', true)
ON CONFLICT (id) DO NOTHING;

-- ── COLLECTION ITEMS ───────────────────────────────────────────────────────────
INSERT INTO collection_items (collection_id, media_id, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 4)
ON CONFLICT (collection_id, media_id) DO NOTHING;
