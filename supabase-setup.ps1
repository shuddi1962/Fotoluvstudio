# fotoluvstudio — Full Supabase Setup Script
# Run this from the project root:  .\supabase-setup.ps1

Write-Host "=== FOTOLUVSTUDIO SUPABASE SETUP ===" -ForegroundColor Green
Write-Host ""

# ── 0. CONFIG ──────────────────────────────────────────────────────────────────
$PROJECT_REF = "cececmpzyrqdnlbdgpur"
$SUPABASE_URL = "https://cececmpzyrqdnlbdgpur.supabase.co"
$SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlY2VjbXB6eXJxZG5sYmRncHVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTg2ODEwNiwiZXhwIjoyMDk3NDQ0MTA2fQ.7dQgIh9iQ1-ULU8xXer-GdpY8-_eU4Ega8WaPq3zEvo"
$ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlY2VjbXB6eXJxZG5sYmRncHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NjgxMDYsImV4cCI6MjA5NzQ0NDEwNn0.ymOiidVUXW0ArQuoeJDhc85DEjMRD5pn2t5vO8WGd1k"

# ── 1. ENSURE SUPABASE CLI IS INSTALLED ────────────────────────────────────
Write-Host "[1/6] Checking Supabase CLI..." -ForegroundColor Yellow
$supa = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supa) {
    Write-Host "  Installing Supabase CLI..." -ForegroundColor Yellow
    npm install -g supabase
} else {
    Write-Host "  Supabase CLI found: $(supabase --version)" -ForegroundColor Green
}

# ── 2. LOGIN ────────────────────────────────────────────────────────────────
Write-Host "[2/6] Login to Supabase..." -ForegroundColor Yellow
Write-Host "  You need a personal access token from: https://supabase.com/dashboard/account/tokens"
Write-Host "  Create one with 'sbp_' prefix, then paste below:" -ForegroundColor Cyan
$token = Read-Host "  Token"
$env:SUPABASE_ACCESS_TOKEN = $token
npx supabase login --token $token
if ($LASTEXITCODE -ne 0) { Write-Host "  Login failed!" -ForegroundColor Red; exit 1 }

# ── 3. LINK PROJECT ─────────────────────────────────────────────────────────
Write-Host "[3/6] Linking project..." -ForegroundColor Yellow
npx supabase link --project-ref $PROJECT_REF
if ($LASTEXITCODE -ne 0) { Write-Host "  Link failed!" -ForegroundColor Red; exit 1 }

# ── 4. PUSH MIGRATIONS ──────────────────────────────────────────────────────
Write-Host "[4/6] Pushing migrations..." -ForegroundColor Yellow
npx supabase db push --include-all
if ($LASTEXITCODE -eq 0) { Write-Host "  Migrations applied!" -ForegroundColor Green }

# ── 5. CREATE STORAGE BUCKETS ───────────────────────────────────────────────
Write-Host "[5/6] Creating storage buckets..." -ForegroundColor Yellow

$buckets = @(
    @{ name = "originals"; public = $false },
    @{ name = "web-derivatives"; public = $true },
    @{ name = "avatars"; public = $true },
    @{ name = "storefront-banners"; public = $true },
    @{ name = "design-uploads"; public = $false }
)

foreach ($bucket in $buckets) {
    $body = @{ name = $bucket.name; public = $bucket.public } | ConvertTo-Json
    $resp = curl -s -X POST "$SUPABASE_URL/storage/v1/bucket" `
        -H "apikey: $SERVICE_ROLE_KEY" `
        -H "Authorization: Bearer $SERVICE_ROLE_KEY" `
        -H "Content-Type: application/json" `
        -d $body
    Write-Host "  $($bucket.name) -> $resp" -ForegroundColor Green
}

# ── 6. DEPLOY EDGE FUNCTIONS ────────────────────────────────────────────────
Write-Host "[6/6] Deploying edge functions..." -ForegroundColor Yellow

$functions = @(
    "serve-media", "apply-watermark", "sync-pod-catalog",
    "generate-mockup", "checkout", "printful-webhook",
    "process-payouts", "manage-subscription"
)

foreach ($fn in $functions) {
    Write-Host "  Deploying $fn..." -ForegroundColor Yellow
    npx supabase functions deploy $fn --project-ref $PROJECT_REF
}

# ── SEED DEFAULT FEE RULES ──────────────────────────────────────────────────
Write-Host "[+] Seeding default platform fee rules..." -ForegroundColor Yellow
curl -s -X POST "$SUPABASE_URL/rest/v1/platform_fee_rules" `
    -H "apikey: $SERVICE_ROLE_KEY" `
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" `
    -H "Content-Type: application/json" `
    -H "Prefer: resolution=merge-duplicates" `
    -d '[{"category": null, "commission_percent": 30}]' | Out-Null
Write-Host "  Default 30% commission rule created!" -ForegroundColor Green

# ── DONE ─────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "=== SETUP COMPLETE ===" -ForegroundColor Green
Write-Host "Site: https://fotoluvstudio.vercel.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Go to Supabase Dashboard -> Auth -> Settings" -ForegroundColor White
Write-Host "     Set Site URL to: https://fotoluvstudio.vercel.app" -ForegroundColor White
Write-Host "  2. Enable Email/Password auth provider" -ForegroundColor White
Write-Host "  3. Set edge function secrets:" -ForegroundColor White
Write-Host "     PRINTFUL_API_KEY, PAYSTACK_SECRET_KEY, STRIPE_SECRET_KEY" -ForegroundColor White
Write-Host "  4. Your store is live at https://fotoluvstudio.vercel.app!" -ForegroundColor Green
