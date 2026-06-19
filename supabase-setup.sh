#!/bin/bash
# fotoluvstudio - Supabase Setup Script (bash/macOS/Linux)
set -e

PROJECT_REF="cececmpzyrqdnlbdgpyr"
SUPABASE_URL="https://cececmpzyrqdnlbdgpyr.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlY2VjbXB6eXJxZG5sYmRncHVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTg2ODEwNiwiZXhwIjoyMDk3NDQ0MTA2fQ.7dQgIh9iQ1-ULU8xXer-GdpY8-_eU4Ega8WaPq3zEvo"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlY2VjbXB6eXJxZG5sYmRncHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NjgxMDYsImV4cCI6MjA5NzQ0NDEwNn0.ymOiidVUXW0ArQuoeJDhc85DEjMRD5pn2t5vO8WGd1k"

echo "=== FOTOLUVSTUDIO SUPABASE SETUP ==="

# 1. Login
echo "[1/6] Login to Supabase..."
echo "Get a token from: https://supabase.com/dashboard/account/tokens"
read -sp "Token: " TOKEN
echo
npx supabase login --token "$TOKEN"

# 2. Link
echo "[2/6] Linking project..."
npx supabase link --project-ref "$PROJECT_REF"

# 3. Push migrations
echo "[3/6] Pushing migrations..."
npx supabase db push --include-all

# 4. Create storage buckets
echo "[4/6] Creating storage buckets..."
for bucket in originals web-derivatives avatars storefront-banners design-uploads; do
  is_public=false
  [ "$bucket" = "web-derivatives" ] || [ "$bucket" = "avatars" ] || [ "$bucket" = "storefront-banners" ] && is_public=true
  curl -s -X POST "$SUPABASE_URL/storage/v1/bucket" \
    -H "apikey: $SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$bucket\",\"public\":$is_public}"
done

# 5. Deploy edge functions
echo "[5/6] Deploying edge functions..."
for fn in serve-media apply-watermark sync-pod-catalog generate-mockup checkout printful-webhook process-payouts manage-subscription; do
  npx supabase functions deploy "$fn" --project-ref "$PROJECT_REF"
done

# 6. Seed default fee rule
echo "[6/6] Seeding default fee rules..."
curl -s -X POST "$SUPABASE_URL/rest/v1/platform_fee_rules" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '[{"category": null, "commission_percent": 30}]'

echo ""
echo "=== SETUP COMPLETE ==="
echo "Site: https://fotoluvstudio.vercel.app"
echo "Next: Set Auth Site URL to https://fotoluvstudio.vercel.app in Supabase Dashboard"
