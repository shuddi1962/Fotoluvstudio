import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req: Request) => {
  try {
    const { seller_product_id, design_url, product_id } = await req.json()

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const printfulApiKey = Deno.env.get("PRINTFUL_API_KEY")

    const response = await fetch("https://api.printful.com/mockup-generator/create-task", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${printfulApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id,
        format: "jpg",
        files: [{ placement: "default", image_url: design_url }],
      }),
    })

    const data = await response.json()

    if (data.result?.task_key) {
      let mockupUrl = ""
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000))
        const statusRes = await fetch(
          `https://api.printful.com/mockup-generator/task?task_key=${data.result.task_key}`,
          { headers: { Authorization: `Bearer ${printfulApiKey}` } }
        )
        const statusData = await statusRes.json()
        if (statusData.result?.mockups?.length > 0) {
          mockupUrl = statusData.result.mockups[0].mockup_url
          break
        }
      }

      if (mockupUrl) {
        await supabase
          .from("seller_products")
          .update({ mockup_url: mockupUrl })
          .eq("id", seller_product_id)
      }
    }

    return new Response(JSON.stringify({ success: true, mockup_url: data.result?.mockups?.[0]?.mockup_url }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
