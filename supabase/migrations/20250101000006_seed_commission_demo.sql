-- fotoluvstudio Commission Demo Seed Data
-- Run after 20250101000005_commission_schema.sql
-- Depends on profiles and seller_profiles from 20250101000003_seed_data.sql

-- ── FABRIC OPTIONS (for Zara Fashion House) ────────────────────────────────────
INSERT INTO fabric_options (id, designer_id, name, description, price_modifier, swatch_image_url, is_active) VALUES
  ('f1000000-0000-0000-0000-000000000001', '72214291-4f4e-4f50-8267-895f17cd408e', 'Premium Aso-Oke', 'Handwoven traditional Yoruba fabric. Rich texture, perfect for statement pieces.', 15000, 'https://picsum.photos/seed/asooke/200/200', true),
  ('f1000000-0000-0000-0000-000000000002', '72214291-4f4e-4f50-8267-895f17cd408e', 'Cotton Blend', 'Soft, breathable cotton blend. Ideal for everyday wear.', 0, 'https://picsum.photos/seed/cotton/200/200', true),
  ('f1000000-0000-0000-0000-000000000003', '72214291-4f4e-4f50-8267-895f17cd408e', 'African Wax Print', 'Vibrant, colorful Ankara/wax print fabric. Each pattern tells a story.', 8000, 'https://picsum.photos/seed/ankara/200/200', true),
  ('f1000000-0000-0000-0000-000000000004', '72214291-4f4e-4f50-8267-895f17cd408e', 'Silk Chiffon', 'Luxurious lightweight silk. Flowing and elegant for evening wear.', 25000, 'https://picsum.photos/seed/silk/200/200', true),
  ('f1000000-0000-0000-0000-000000000005', '72214291-4f4e-4f50-8267-895f17cd408e', 'Linen Blend', 'Natural linen blend. Crisp, cool, and perfect for tropical climates.', 5000, 'https://picsum.photos/seed/linen/200/200', true),
  ('f1000000-0000-0000-0000-000000000006', '72214291-4f4e-4f50-8267-895f17cd408e', 'Adire Indigo', 'Traditional Yoruba indigo-dyed fabric with resist-print patterns.', 12000, 'https://picsum.photos/seed/adire/200/200', true),
  ('f1000000-0000-0000-0000-000000000007', '72214291-4f4e-4f50-8267-895f17cd408e', 'Organza', 'Sheer, crisp fabric. Beautiful for overlays and statement sleeves.', 18000, 'https://picsum.photos/seed/organza/200/200', true),
  ('f1000000-0000-0000-0000-000000000008', '72214291-4f4e-4f50-8267-895f17cd408e', 'Kente Strip', 'Handwoven Ghanaian kente-inspired strips. Bold, ceremonial, iconic.', 20000, 'https://picsum.photos/seed/kente/200/200', false)
ON CONFLICT (id) DO NOTHING;

-- ── SELLER COMMISSION SETTINGS (for Zara Fashion House) ───────────────────────
INSERT INTO seller_commission_settings (designer_id, accepts_custom_fabric, default_turnaround_days, default_deposit_percentage, studio_location) VALUES
  ('72214291-4f4e-4f50-8267-895f17cd408e', true, 21, 50, 'Zara Fashion Atelier, 45 Norman Williams Street, Ikoyi, Lagos')
ON CONFLICT (designer_id) DO NOTHING;

-- ── SELLER AVAILABILITY (for Zara, Mon-Sat 9am-5pm) ──────────────────────────
INSERT INTO seller_availability (designer_id, day_of_week, start_time, end_time, is_active) VALUES
  ('72214291-4f4e-4f50-8267-895f17cd408e', 1, '09:00', '17:00', true),
  ('72214291-4f4e-4f50-8267-895f17cd408e', 2, '09:00', '17:00', true),
  ('72214291-4f4e-4f50-8267-895f17cd408e', 3, '09:00', '17:00', true),
  ('72214291-4f4e-4f50-8267-895f17cd408e', 4, '09:00', '17:00', true),
  ('72214291-4f4e-4f50-8267-895f17cd408e', 5, '09:00', '17:00', true),
  ('72214291-4f4e-4f50-8267-895f17cd408e', 6, '10:00', '15:00', true)
ON CONFLICT (id) DO NOTHING;

-- ── COMMISSION REQUESTS (sample requests from Amara to Zara) ──────────────────
INSERT INTO commission_requests (id, customer_id, designer_id, source_type, source_media_id, garment_category, fabric_choice_id, customer_notes, status, quoted_price, deposit_percentage, deposit_amount, deposit_paid_at, estimated_completion_date, created_at, updated_at) VALUES
  (
    'cr100000-0000-0000-0000-000000000001',
    'd02f76e5-2946-4bab-b02a-bb27d0f808de',
    '72214291-4f4e-4f50-8267-895f17cd408e',
    'published_design',
    'b4000000-0000-0000-0000-000000000001',
    'dress',
    'f1000000-0000-0000-0000-000000000003',
    'I love the Summer Breeze look but would like it in ankle-length with a higher neckline. Also considering adding puff sleeves.',
    'quoted',
    185000,
    50,
    NULL,
    NULL,
    '2026-07-15',
    now() - interval '5 days',
    now() - interval '2 days'
  ),
  (
    'cr100000-0000-0000-0000-000000000002',
    'd02f76e5-2946-4bab-b02a-bb27d0f808de',
    '72214291-4f4e-4f50-8267-895f17cd408e',
    'custom_upload',
    NULL,
    'top',
    'f1000000-0000-0000-0000-000000000002',
    'I have a photo of a blouse from Pinterest — clean lines, slightly oversized fit with a mandarin collar. Would love something similar in a cotton blend.',
    'pending_review',
    NULL,
    50,
    NULL,
    NULL,
    NULL,
    now() - interval '1 day',
    now() - interval '1 day'
  ),
  (
    'cr100000-0000-0000-0000-000000000003',
    'd02f76e5-2946-4bab-b02a-bb27d0f808de',
    '72214291-4f4e-4f50-8267-895f17cd408e',
    'published_design',
    'b4000000-0000-0000-0000-000000000002',
    'dress',
    'f1000000-0000-0000-0000-000000000004',
    'Would like the Evening Glam in silk chiffon with a slightly longer train. Also, could you add some subtle beading at the waistline?',
    'deposit_paid',
    320000,
    50,
    160000,
    now() - interval '3 days',
    '2026-08-01',
    now() - interval '10 days',
    now() - interval '3 days'
  ),
  (
    'cr100000-0000-0000-0000-000000000004',
    'd02f76e5-2946-4bab-b02a-bb27d0f808de',
    '72214291-4f4e-4f50-8267-895f17cd408e',
    'published_design',
    'b4000000-0000-0000-0000-000000000001',
    'jacket',
    'f1000000-0000-0000-0000-000000000006',
    'Inspired by the Summer Breeze aesthetic — I want a cropped jacket in Adire fabric. Something I can wear over jeans or a pencil skirt.',
    'in_production',
    150000,
    50,
    75000,
    now() - interval '7 days',
    '2026-07-22',
    now() - interval '14 days',
    now() - interval '5 days'
  ),
  (
    'cr100000-0000-0000-0000-000000000005',
    'd02f76e5-2946-4bab-b02a-bb27d0f808de',
    '72214291-4f4e-4f50-8267-895f17cd408e',
    'custom_upload',
    NULL,
    'trousers',
    NULL,
    'I have my own fabric (a beautiful linen I got from the market). Looking for wide-leg trousers with a high waist and side pockets. No zip — I prefer a drawstring waist.',
    'pending_review',
    NULL,
    50,
    NULL,
    NULL,
    NULL,
    now() - interval '6 hours',
    now() - interval '6 hours'
  ),
  (
    'cr100000-0000-0000-0000-000000000006',
    'd02f76e5-2946-4bab-b02a-bb27d0f808de',
    '72214291-4f4e-4f50-8267-895f17cd408e',
    'published_design',
    'b4000000-0000-0000-0000-000000000002',
    'skirt',
    'f1000000-0000-0000-0000-000000000005',
    'Would like a midi-length A-line skirt in the linen blend. Elastic waistband for comfort. Something versatile for both work and weekend.',
    'ready',
    85000,
    50,
    42500,
    now() - interval '12 days',
    '2026-06-30',
    now() - interval '20 days',
    now() - interval '1 day'
  )
ON CONFLICT (id) DO NOTHING;

-- ── COMMISSION MESSAGES ───────────────────────────────────────────────────────
INSERT INTO commission_messages (commission_request_id, sender_id, message, created_at) VALUES
  ('cr100000-0000-0000-0000-000000000001', 'd02f76e5-2946-4bab-b02a-bb27d0f808de', 'Hi Zara! I''m so excited about this piece. Let me know if you need any more details about what I have in mind.', now() - interval '5 days'),
  ('cr100000-0000-0000-0000-000000000001', '72214291-4f4e-4f50-8267-895f17cd408e', 'Hello Amara! Thank you so much for your interest. I love the idea of ankle-length with a higher neckline on the Summer Breeze silhouette. Let me work up a sketch and quote for you.', now() - interval '4 days'),
  ('cr100000-0000-0000-0000-000000000001', '72214291-4f4e-4f50-8267-895f17cd408e', 'I''ve sent the quote to your dashboard! For the puff sleeves — do you prefer a soft gathered puff or something more structured?', now() - interval '2 days'),
  ('cr100000-0000-0000-0000-000000000001', 'd02f76e5-2946-4bab-b02a-bb27d0f808de', 'Soft gathered puff please! And the quote looks great. I''ll pay the deposit as soon as I''m ready to confirm.', now() - interval '2 days'),
  ('cr100000-0000-0000-0000-000000000003', '72214291-4f4e-4f50-8267-895f17cd408e', 'Amara! The Evening Glam in silk chiffon is going to be stunning. I''ve started sourcing the fabric and will send you progress photos soon!', now() - interval '4 days'),
  ('cr100000-0000-0000-0000-000000000004', '72214291-4f4e-4f50-8267-895f17cd408e', 'The Adire fabric for your jacket has arrived and it''s beautiful! Here''s a sneak peek of the material.', now() - interval '5 days'),
  ('cr100000-0000-0000-0000-000000000004', '72214291-4f4e-4f50-8267-895f17cd408e', 'Update: I''ve cut the pattern pieces and will start assembling tomorrow. The cropped silhouette in Adire is going to be 🔥', now() - interval '4 days'),
  ('cr100000-0000-0000-0000-000000000004', 'd02f76e5-2946-4bab-b02a-bb27d0f808de', 'Can''t wait to see it! Thank you for the updates — I really appreciate being kept in the loop.', now() - interval '3 days'),
  ('cr100000-0000-0000-0000-000000000006', '72214291-4f4e-4f50-8267-895f17cd408e', 'Your A-line skirt is ready for delivery! The linen blend worked perfectly. You''re going to love how it drapes.', now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

-- ── CUSTOMER MEASUREMENTS ─────────────────────────────────────────────────────
INSERT INTO customer_measurements (customer_id, commission_request_id, garment_category, measurements, unit) VALUES
  ('d02f76e5-2946-4bab-b02a-bb27d0f808de', 'cr100000-0000-0000-0000-000000000001', 'dress', '{"bust": 92, "waist": 76, "hip": 98, "shoulder_width": 40, "sleeve_length": 58, "dress_length": 140, "height": 170}', 'cm'),
  ('d02f76e5-2946-4bab-b02a-bb27d0f808de', 'cr100000-0000-0000-0000-000000000003', 'dress', '{"bust": 92, "waist": 76, "hip": 98, "shoulder_width": 40, "sleeve_length": 60, "dress_length": 155, "height": 170}', 'cm'),
  ('d02f76e5-2946-4bab-b02a-bb27d0f808de', 'cr100000-0000-0000-0000-000000000004', 'jacket', '{"chest": 96, "waist": 80, "hip": 100, "shoulder_width": 42, "sleeve_length": 58, "neck": 38}', 'cm'),
  ('d02f76e5-2946-4bab-b02a-bb27d0f808de', 'cr100000-0000-0000-0000-000000000006', 'skirt', '{"waist": 76, "hip": 98, "skirt_length": 75}', 'cm')
ON CONFLICT (id) DO NOTHING;

-- ── MEASUREMENT APPOINTMENTS ──────────────────────────────────────────────────
INSERT INTO measurement_appointments (commission_request_id, designer_id, scheduled_for, location, status) VALUES
  ('cr100000-0000-0000-0000-000000000003', '72214291-4f4e-4f50-8267-895f17cd408e', now() + interval '3 days', 'Zara Fashion Atelier, 45 Norman Williams Street, Ikoyi, Lagos', 'scheduled'),
  ('cr100000-0000-0000-0000-000000000006', '72214291-4f4e-4f50-8267-895f17cd408e', now() - interval '5 days', 'Zara Fashion Atelier, 45 Norman Williams Street, Ikoyi, Lagos', 'completed')
ON CONFLICT (id) DO NOTHING;

-- ── MEASUREMENT PROFILES (Amara's saved measurements) ─────────────────────────
INSERT INTO measurement_profiles (customer_id, label, measurements, unit) VALUES
  ('d02f76e5-2946-4bab-b02a-bb27d0f808de', 'My Standard Measurements', '{"bust": 92, "waist": 76, "hip": 98, "shoulder_width": 40, "height": 170}', 'cm'),
  ('d02f76e5-2946-4bab-b02a-bb27d0f808de', 'Dress Measurements', '{"bust": 92, "waist": 76, "hip": 98, "shoulder_width": 40, "sleeve_length": 60, "dress_length": 145, "height": 170}', 'cm')
ON CONFLICT (id) DO NOTHING;
