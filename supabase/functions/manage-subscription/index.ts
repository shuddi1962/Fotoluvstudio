import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req: Request) => {
  try {
    const { user_id, action, provider, billing_reference } = await req.json()
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    if (action === "subscribe") {
      const { data: sub, error } = await supabase
        .from("subscriptions")
        .insert({
          user_id,
          status: "active",
          billing_provider: provider,
          billing_reference,
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      await supabase
        .from("profiles")
        .update({ is_gold_member: true, gold_member_since: new Date().toISOString() })
        .eq("id", user_id)

      return new Response(JSON.stringify({ success: true, subscription: sub }))
    }

    if (action === "cancel") {
      await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("user_id", user_id)

      await supabase
        .from("profiles")
        .update({ is_gold_member: false })
        .eq("id", user_id)

      return new Response(JSON.stringify({ success: true }))
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
