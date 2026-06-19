import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req: Request) => {
  try {
    const payload = await req.json()
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const printfulApiKey = Deno.env.get("PRINTFUL_API_KEY")

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: payload.customer_id,
        total_amount: payload.total_amount,
        payment_provider: payload.payment_provider,
        payment_reference: payload.payment_reference,
        shipping_address: payload.shipping_address,
        status: "paid",
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items and calculate commissions
    for (const item of payload.items) {
      const { data: feeRule } = await supabase
        .from("platform_fee_rules")
        .select("*")
        .is("category", null)
        .single()

      const { data: sellerProduct } = await supabase
        .from("seller_products")
        .select("*, seller_profiles(*)")
        .eq("id", item.seller_product_id)
        .single()

      const commissionPercent = sellerProduct?.seller_profiles?.commission_rate_override ?? feeRule?.commission_percent ?? 30
      const commission = (item.price * commissionPercent) / 100
      const sellerPayout = item.price - commission

      await supabase.from("order_items").insert({
        order_id: order.id,
        seller_product_id: item.seller_product_id,
        quantity: item.quantity,
        price_at_purchase: item.price,
        pod_base_cost_at_purchase: item.base_cost,
        commission_amount: commission,
        seller_payout_amount: sellerPayout,
      })
    }

    // Place Printful order
    if (printfulApiKey) {
      const printfulItems = payload.items.map((item: any) => ({
        sync_product_id: item.sync_product_id,
        quantity: item.quantity,
      }))

      await fetch("https://api.printful.com/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${printfulApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: {
            name: payload.shipping_address.name,
            address1: payload.shipping_address.line1,
            city: payload.shipping_address.city,
            state_code: payload.shipping_address.state,
            country_code: payload.shipping_address.country,
            zip: payload.shipping_address.zip,
          },
          items: printfulItems,
        }),
      })
    }

    return new Response(JSON.stringify({ success: true, order_id: order.id }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
