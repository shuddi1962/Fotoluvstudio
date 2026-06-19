import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const printfulApiKey = Deno.env.get("PRINTFUL_API_KEY")
  if (!printfulApiKey) {
    return new Response(JSON.stringify({ error: "Printful API key not configured" }), { status: 500 })
  }

  const categories = ["wall_art", "home_decor", "apparel", "lifestyle", "stationery"]

  for (const category of categories) {
    try {
      const response = await fetch(
        `https://api.printful.com/store/products?category=${category}`,
        { headers: { Authorization: `Bearer ${printfulApiKey}` } }
      )

      if (!response.ok) continue

      const { result } = await response.json()
      for (const product of result || []) {
        await supabase.from("pod_products").upsert({
          printful_product_id: String(product.id),
          category,
          name: product.name,
          base_cost: product.price,
          available_sizes: product.sizes || [],
          available_variants: product.variants || [],
          is_active: true,
          synced_at: new Date().toISOString(),
        }, { onConflict: "printful_product_id" })
      }
    } catch (err) {
      console.error(`Failed to sync ${category}:`, err)
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  })
})
