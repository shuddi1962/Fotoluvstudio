import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req: Request) => {
  try {
    const { media_id } = await req.json()

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const { data: media } = await supabase
      .from("media")
      .select("*")
      .eq("id", media_id)
      .single()

    if (!media) {
      return new Response(JSON.stringify({ error: "Media not found" }), { status: 404 })
    }

    const { data: original } = await supabase.storage
      .from("originals")
      .download(media.storage_path_original)

    if (!original) {
      return new Response(JSON.stringify({ error: "Original file not found" }), { status: 404 })
    }

    const watermarkPath = `watermarked/${media.storage_path_original}`
    const { error: uploadError } = await supabase.storage
      .from("web-derivatives")
      .upload(watermarkPath, original, {
        contentType: original.type,
        upsert: true,
      })

    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), { status: 500 })
    }

    await supabase
      .from("media")
      .update({ storage_path_derivative: watermarkPath })
      .eq("id", media_id)

    return new Response(
      JSON.stringify({ success: true, path: watermarkPath }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
