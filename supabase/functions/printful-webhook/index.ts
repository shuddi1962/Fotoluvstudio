import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req: Request) => {
  try {
    const payload = await req.json()
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    if (payload.type === "order_updated" || payload.type === "package_shipped") {
      const printfulOrderId = String(payload.data?.order?.id)
      const status = payload.type === "package_shipped" ? "shipped" : "fulfilled"
      const trackingUrl = payload.data?.order?.tracking?.url || null

      await supabase
        .from("orders")
        .update({ status, tracking_url: trackingUrl })
        .eq("printful_order_id", printfulOrderId)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
