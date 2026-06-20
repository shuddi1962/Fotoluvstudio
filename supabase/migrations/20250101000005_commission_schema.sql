-- Commissioning System: Bespoke Design Made-to-Measure
-- Extends core_schema (20250101000001) and addendum (20250101000004)
-- Requires fashion showcase and notification system to be in place first

-- 1. FABRIC OPTIONS (designer-managed catalog)
CREATE TABLE IF NOT EXISTS fabric_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_modifier NUMERIC NOT NULL DEFAULT 0,
  swatch_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. COMMISSION REQUESTS (core table)
CREATE TABLE IF NOT EXISTS commission_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  designer_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('published_design', 'custom_upload')),
  source_media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  inspiration_media_ids UUID[] DEFAULT '{}',
  garment_category TEXT,
  fabric_choice_id UUID REFERENCES fabric_options(id) ON DELETE SET NULL,
  customer_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'quoted', 'deposit_paid', 'in_production', 'fitting_scheduled', 'ready', 'completed', 'cancelled')),
  quoted_price NUMERIC,
  deposit_percentage INT DEFAULT 50 CHECK (deposit_percentage >= 0 AND deposit_percentage <= 100),
  deposit_amount NUMERIC,
  deposit_paid_at TIMESTAMPTZ,
  balance_paid_at TIMESTAMPTZ,
  estimated_completion_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. CUSTOMER MEASUREMENTS (per-commission or reusable profile)
CREATE TABLE IF NOT EXISTS customer_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  commission_request_id UUID REFERENCES commission_requests(id) ON DELETE CASCADE,
  garment_category TEXT,
  measurements JSONB NOT NULL DEFAULT '{}',
  unit TEXT NOT NULL DEFAULT 'cm' CHECK (unit IN ('cm', 'inches')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. MEASUREMENT APPOINTMENTS (in-person fitting bookings)
CREATE TABLE IF NOT EXISTS measurement_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_request_id UUID NOT NULL REFERENCES commission_requests(id) ON DELETE CASCADE,
  designer_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. COMMISSION MESSAGES (customer-designer conversation thread)
CREATE TABLE IF NOT EXISTS commission_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_request_id UUID NOT NULL REFERENCES commission_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. MEASUREMENT PROFILES (reusable, optional convenience for customers)
CREATE TABLE IF NOT EXISTS measurement_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'My Measurements',
  measurements JSONB NOT NULL DEFAULT '{}',
  unit TEXT NOT NULL DEFAULT 'cm' CHECK (unit IN ('cm', 'inches')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. SELLER COMMISSION SETTINGS (designer config for commissioning)
CREATE TABLE IF NOT EXISTS seller_commission_settings (
  designer_id UUID PRIMARY KEY REFERENCES seller_profiles(id) ON DELETE CASCADE,
  accepts_custom_fabric BOOLEAN NOT NULL DEFAULT false,
  default_turnaround_days INT NOT NULL DEFAULT 21,
  default_deposit_percentage INT NOT NULL DEFAULT 50,
  studio_location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. SELLER AVAILABILITY (for measurement appointments)
CREATE TABLE IF NOT EXISTS seller_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 9. NOTIFICATIONS type expansion
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'new_event', 'order_shipped', 'new_sale', 'payout_processed',
    'new_follower', 'membership_reminder', 'order_confirmation',
    'commission_request', 'commission_quote', 'commission_deposit_confirmed',
    'commission_status_update', 'commission_message', 'commission_appointment_reminder'
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_commission_requests_customer ON commission_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_commission_requests_designer ON commission_requests(designer_id);
CREATE INDEX IF NOT EXISTS idx_commission_requests_status ON commission_requests(status);
CREATE INDEX IF NOT EXISTS idx_customer_measurements_customer ON customer_measurements(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_measurements_commission ON customer_measurements(commission_request_id);
CREATE INDEX IF NOT EXISTS idx_commission_messages_commission ON commission_messages(commission_request_id);
CREATE INDEX IF NOT EXISTS idx_measurement_appointments_designer ON measurement_appointments(designer_id);
CREATE INDEX IF NOT EXISTS idx_measurement_appointments_commission ON measurement_appointments(commission_request_id);
CREATE INDEX IF NOT EXISTS idx_fabric_options_designer ON fabric_options(designer_id);
CREATE INDEX IF NOT EXISTS idx_seller_availability_designer ON seller_availability(designer_id);
