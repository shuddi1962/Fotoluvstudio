# fotoluvstudio — Demo Auth User Setup
# Run this AFTER supabase-setup.ps1 to create demo login accounts
# .\supabase-setup-auth.ps1

param(
  [string]$ProjectRef = "cececmpzyrqdnlbdgpur"
)

$SUPABASE_URL = "https://$ProjectRef.supabase.co"
$SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlY2VjbXB6eXJxZG5sYmRncHVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTg2ODEwNiwiZXhwIjoyMDk3NDQ0MTA2fQ.7dQgIh9iQ1-ULU8xXer-GdpY8-_eU4Ega8WaPq3zEvo"

Write-Host "=== CREATING DEMO AUTH USERS ===" -ForegroundColor Green
Write-Host ""

$demoUsers = @(
  @{
    id = "4e5667c8-ff2f-4433-ba88-f4d21f1f3b84"
    email = "tunde@fotoluvstudio.com"
    password = "Demo@123456"
    role = "admin"
    name = "Tunde Adebayo (Owner)"
  }
  @{
    id = "5dfdbb28-83f3-4732-a795-aa9d9d8ebcdd"
    email = "chioma@fotoluvstudio.com"
    password = "Demo@123456"
    role = "seller"
    name = "Chioma Eze (Photographer)"
  }
  @{
    id = "d02f76e5-2946-4bab-b02a-bb27d0f808de"
    email = "amara@fotoluvstudio.com"
    password = "Demo@123456"
    role = "client"
    name = "Amara Okafor (Gold Member)"
  }
  @{
    id = "eb4274b3-e332-47d4-98c5-56c88adcdb03"
    email = "emeka@fotoluvstudio.com"
    password = "Demo@123456"
    role = "seller"
    name = "Emeka Nwosu (Designer)"
  }
  @{
    id = "72214291-4f4e-4f50-8267-895f17cd408e"
    email = "zara@fotoluvstudio.com"
    password = "Demo@123456"
    role = "seller"
    name = "Zara Adebayo (Fashion Designer)"
  }
)

foreach ($u in $demoUsers) {
  Write-Host "Creating $($u.name) ($($u.email))..." -ForegroundColor Yellow

  # 1. Create the auth user (idempotent — will fail silently if exists)
  $authBody = @{
    email = $u.email
    password = $u.password
    email_confirm = $true
    id = $u.id
  } | ConvertTo-Json

  $authResp = curl -s -X POST "$SUPABASE_URL/auth/v1/admin/users" `
    -H "apikey: $SERVICE_ROLE_KEY" `
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" `
    -H "Content-Type: application/json" `
    -d $authBody

  $authResult = $authResp | ConvertFrom-Json

  if ($authResult.id) {
    Write-Host "  Auth user created: $($authResult.id)" -ForegroundColor Green
  } elseif ($authResult.message -and $authResult.message -match "already exists") {
    Write-Host "  Auth user already exists (skipped)" -ForegroundColor Cyan
  } elseif ($authResult.msg -and $authResult.msg -match "already exists") {
    Write-Host "  Auth user already exists (skipped)" -ForegroundColor Cyan
  } else {
    Write-Host "  Auth response: $authResp" -ForegroundColor DarkYellow
  }

  # 2. Ensure the profile record exists
  $profileBody = @{
    id = $u.id
    full_name = $u.name
    role = $u.role
    is_gold_member = ($u.role -eq "admin" -or $u.name -match "Gold")
  } | ConvertTo-Json

  curl -s -X POST "$SUPABASE_URL/rest/v1/profiles" `
    -H "apikey: $SERVICE_ROLE_KEY" `
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" `
    -H "Content-Type: application/json" `
    -H "Prefer: resolution=merge-duplicates" `
    -d $profileBody | Out-Null

  Write-Host "  Profile synced." -ForegroundColor Green

  # 3. Create seller_profiles for seller/admin roles
  if ($u.role -eq "seller" -or $u.role -eq "admin") {
    $slug = $u.name.Split("(")[0].Trim().ToLower().Replace(" ", "-")
    $sellerBody = @{
      id = $u.id
      storefront_name = $u.name.Split("(")[0].Trim()
      storefront_slug = $slug
      bio = "Demo account for testing purposes."
      approved_at = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    } | ConvertTo-Json

    curl -s -X POST "$SUPABASE_URL/rest/v1/seller_profiles" `
      -H "apikey: $SERVICE_ROLE_KEY" `
      -H "Authorization: Bearer $SERVICE_ROLE_KEY" `
      -H "Content-Type: application/json" `
      -H "Prefer: resolution=merge-duplicates" `
      -d $sellerBody | Out-Null

    Write-Host "  Seller profile synced." -ForegroundColor Green
  }
}

Write-Host ""
Write-Host "=== DEMO ACCOUNTS CREATED ===" -ForegroundColor Green
Write-Host ""
Write-Host "All passwords: Demo@123456" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Admin:      tunde@fotoluvstudio.com" -ForegroundColor White
Write-Host "  Seller/Photog: chioma@fotoluvstudio.com" -ForegroundColor White
Write-Host "  Seller/Designer: emeka@fotoluvstudio.com" -ForegroundColor White
Write-Host "  Seller/Fashion: zara@fotoluvstudio.com" -ForegroundColor White
Write-Host "  Client (Gold): amara@fotoluvstudio.com" -ForegroundColor White
Write-Host ""
Write-Host "Login at: https://fotoluvstudio.vercel.app/login" -ForegroundColor Cyan
