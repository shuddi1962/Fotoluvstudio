-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_fee_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_inquiries ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Service role can manage all profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- EVENTS
CREATE POLICY "Clients can view own events" ON events
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Admin can manage all events" ON events
  FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Service role can manage all events" ON events
  FOR ALL USING (auth.role() = 'service_role');

-- MEDIA
CREATE POLICY "Public gallery media is viewable by all" ON media
  FOR SELECT USING (context = 'public_gallery' OR context = 'fashion_showcase');
CREATE POLICY "Client event media viewable by client or admin" ON media
  FOR SELECT USING (
    context = 'client_event' AND (
      auth.uid() IN (SELECT client_id FROM events WHERE id = event_id)
      OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
      OR auth.uid() = owner_id
    )
  );
CREATE POLICY "Sellers can manage own media" ON media
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admin can manage all media" ON media
  FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Service role can manage all media" ON media
  FOR ALL USING (auth.role() = 'service_role');

-- COLLECTIONS
CREATE POLICY "Published collections viewable by all" ON collections
  FOR SELECT USING (true);
CREATE POLICY "Admin and owners can manage collections" ON collections
  FOR ALL USING (auth.uid() = owner_id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- FAVORITES
CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Favorites viewable by owner" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

-- SELLER PROFILES
CREATE POLICY "Seller profiles viewable by all" ON seller_profiles
  FOR SELECT USING (true);
CREATE POLICY "Sellers can update own profile" ON seller_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can manage all seller profiles" ON seller_profiles
  FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Service role can manage all" ON seller_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- POD PRODUCTS
CREATE POLICY "Pod products viewable by all" ON pod_products
  FOR SELECT USING (true);
CREATE POLICY "Service role can manage pod products" ON pod_products
  FOR ALL USING (auth.role() = 'service_role');

-- SELLER PRODUCTS
CREATE POLICY "Published products viewable by all" ON seller_products
  FOR SELECT USING (is_published = true);
CREATE POLICY "Sellers can manage own products" ON seller_products
  FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "Admin can manage all products" ON seller_products
  FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- PLATFORM FEE RULES
CREATE POLICY "Service role only" ON platform_fee_rules
  FOR ALL USING (auth.role() = 'service_role');

-- ORDERS
CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Admin can manage all orders" ON orders
  FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Service role can manage all" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- ORDER ITEMS
CREATE POLICY "Customers can view own order items" ON order_items
  FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid()));
CREATE POLICY "Sellers can view own order items" ON order_items
  FOR SELECT USING (
    seller_product_id IN (
      SELECT id FROM seller_products WHERE seller_id = auth.uid()
    )
  );
CREATE POLICY "Admin can view all order items" ON order_items
  FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- PAYOUTS
CREATE POLICY "Sellers can view own payouts" ON payouts
  FOR SELECT USING (seller_id = auth.uid());
CREATE POLICY "Admin can manage all payouts" ON payouts
  FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- SUBSCRIPTIONS
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- REVIEWS
CREATE POLICY "Reviews viewable by all" ON reviews
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- FOLLOWS
CREATE POLICY "Follows viewable by all" ON follows
  FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON follows
  FOR ALL USING (auth.uid() = follower_id);

-- BOOKING INQUIRIES
CREATE POLICY "Admin can manage inquiries" ON booking_inquiries
  FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Anyone can submit inquiries" ON booking_inquiries
  FOR INSERT WITH CHECK (true);

-- Storage bucket policies
-- web-derivatives (public read)
CREATE POLICY "Web derivatives public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'web-derivatives');

-- avatars (public read)
CREATE POLICY "Avatars public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- storefront-banners (public read)
CREATE POLICY "Storefront banners public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'storefront-banners');

-- originals (authenticated only via edge function)
CREATE POLICY "Originals access via service role only" ON storage.objects
  FOR ALL USING (bucket_id = 'originals' AND auth.role() = 'service_role');

-- design-uploads (authenticated users)
CREATE POLICY "Design uploads owner access" ON storage.objects
  FOR ALL USING (bucket_id = 'design-uploads' AND auth.uid() = owner_id::uuid);
CREATE POLICY "Design uploads admin access" ON storage.objects
  FOR ALL USING (bucket_id = 'design-uploads' AND auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Design uploads service role access" ON storage.objects
  FOR ALL USING (bucket_id = 'design-uploads' AND auth.role() = 'service_role');
