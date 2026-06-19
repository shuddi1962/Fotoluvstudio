import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0]
  const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0]

  const { data: sellers } = await supabase
    .from("seller_profiles")
    .select("id, payout_method")

  for (const seller of sellers || []) {
    const { data: items } = await supabase
      .from("order_items")
      .select("seller_payout_amount")
      .eq("seller_products.seller_id", seller.id)
      .gte("orders.created_at", periodStart)
      .lte("orders.created_at", periodEnd + "T23:59:59Z")

    const totalAmount = items?.reduce((sum, i) => sum + Number(i.seller_payout_amount), 0) || 0

    if (totalAmount > 0) {
      await supabase.from("payouts").insert({
        seller_id: seller.id,
        period_start: periodStart,
        period_end: periodEnd,
        total_amount: totalAmount,
        status: "pending",
      })
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  })
})
