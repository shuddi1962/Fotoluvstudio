export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: 'client' | 'seller' | 'admin'
  is_gold_member: boolean
  gold_member_since: string | null
  stripe_or_paystack_customer_id: string | null
  created_at: string
}

export interface Event {
  id: string
  client_id: string
  created_by: string
  title: string
  event_date: string | null
  is_published: boolean
  created_at: string
}

export interface Media {
  id: string
  owner_id: string
  event_id: string | null
  context: 'public_gallery' | 'client_event' | 'fashion_showcase' | 'seller_design'
  storage_path_original: string
  storage_path_derivative: string | null
  media_type: 'photo' | 'video'
  title: string | null
  tags: string[] | null
  is_featured: boolean
  width_px: number | null
  height_px: number | null
  watermark_tile_applied: boolean
  created_at: string
}

export interface Collection {
  id: string
  owner_id: string
  title: string
  description: string | null
  cover_media_id: string | null
  created_at: string
}

export interface CollectionItem {
  collection_id: string
  media_id: string
  sort_order: number
}

export interface Favorite {
  user_id: string
  media_id: string
  created_at: string
}

export interface SellerProfile {
  id: string
  storefront_name: string
  storefront_slug: string
  bio: string | null
  banner_url: string | null
  accent_color: string | null
  payout_method: string | null
  commission_rate_override: number | null
  approved_at: string | null
  created_at: string
}

export interface PodProduct {
  id: string
  printful_product_id: string | null
  category: 'wall_art' | 'home_decor' | 'apparel' | 'lifestyle' | 'stationery'
  name: string
  base_cost: number
  available_sizes: any
  available_variants: any
  is_active: boolean
  synced_at: string
}

export interface SellerProduct {
  id: string
  seller_id: string
  media_id: string
  pod_product_id: string
  selected_variant: any
  seller_price: number
  mockup_url: string | null
  is_published: boolean
  created_at: string
}

export interface PlatformFeeRule {
  id: string
  category: string | null
  commission_percent: number
  effective_from: string
}

export interface Order {
  id: string
  customer_id: string | null
  guest_email: string | null
  status: 'pending' | 'paid' | 'fulfilled' | 'shipped' | 'cancelled'
  total_amount: number
  payment_provider: 'paystack' | 'flutterwave' | 'stripe' | null
  payment_reference: string | null
  shipping_address: any
  printful_order_id: string | null
  tracking_url: string | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  seller_product_id: string
  quantity: number
  price_at_purchase: number
  pod_base_cost_at_purchase: number
  commission_amount: number
  seller_payout_amount: number
}

export interface Payout {
  id: string
  seller_id: string
  period_start: string
  period_end: string
  total_amount: number
  status: 'pending' | 'paid'
  paid_at: string | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  status: 'active' | 'past_due' | 'cancelled'
  billing_provider: string | null
  billing_reference: string | null
  current_period_end: string | null
  created_at: string
}

export interface Review {
  id: string
  order_id: string
  seller_product_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'new_event' | 'order_shipped' | 'new_sale' | 'payout_processed' | 'new_follower' | 'membership_reminder' | 'order_confirmation'
  title: string
  message: string | null
  is_read: boolean
  link: string | null
  created_at: string
}

export interface Follow {
  follower_id: string
  seller_id: string
  created_at: string
}

export interface BookingInquiry {
  id: string
  name: string
  email: string
  phone: string | null
  event_type: string | null
  event_date: string | null
  budget_range: string | null
  message: string | null
  status: 'new' | 'read' | 'contacted' | 'closed'
  created_at: string
}

export interface DownloadTier {
  id: string
  media_type: 'photo' | 'video'
  tier_name: string
  width_px: number
  height_px: number
  is_free_tier: boolean
  sort_order: number
  created_at: string
}

export interface CartItem {
  id: string
  cart_owner_id: string | null
  guest_session_id: string | null
  seller_product_id: string
  quantity: number
  created_at: string
}

export interface MediaEdit {
  id: string
  media_id: string
  edited_by: string | null
  tool_used: 'add_text' | 'canva' | 'convert_to_gif'
  result_storage_path: string | null
  source_was_watermarked: boolean
  created_at: string
}
