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

    const orderPayload: any = {
      total_amount: payload.total_amount,
      payment_provider: payload.payment_provider,
      payment_reference: payload.payment_reference,
      shipping_address: payload.shipping_address,
      status: "paid",
    }

    if (payload.customer_id) {
      orderPayload.customer_id = payload.customer_id
    } else {
      orderPayload.guest_email = payload.guest_email
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderPayload)
      .select()
      .single()

    if (orderError) throw orderError

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

      await supabase.from("cart_items").delete().eq("seller_product_id", item.seller_product_id)
    }

    if (printfulApiKey) {
      const printfulItems = payload.items.map((item: any) => ({
        sync_product_id: item.sync_product_id,
        quantity: item.quantity,
      }))

      const printfulRes = await fetch("https://api.printful.com/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${printfulApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: {
            name: payload.shipping_address.name,
            address1: payload.shipping_address.line1,
            address2: payload.shipping_address.line2 || "",
            city: payload.shipping_address.city,
            state_code: payload.shipping_address.state,
            country_code: payload.shipping_address.country,
            zip: payload.shipping_address.zip,
            email: payload.guest_email || payload.customer_email,
          },
          items: printfulItems,
        }),
      })

      const printfulData = await printfulRes.json()
      if (printfulData.result?.id) {
        await supabase
          .from("orders")
          .update({ printful_order_id: String(printfulData.result.id) })
          .eq("id", order.id)
      }
    }

    if (payload.customer_id) {
      await supabase.from("notifications").insert({
        user_id: payload.customer_id,
        type: "order_confirmation",
        title: "Order Confirmed",
        message: `Your order #${order.id.slice(0, 8)} has been placed successfully.`,
        link: `/orders/${order.id}`,
      })
    }

    return new Response(JSON.stringify({ success: true, order_id: order.id }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
