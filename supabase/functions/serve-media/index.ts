import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req: Request) => {
  try {
    const { media_id } = await req.json()
    const authHeader = req.headers.get("Authorization") || ""
    const token = authHeader.replace("Bearer ", "")

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: media, error: mediaError } = await supabase
      .from("media")
      .select("*")
      .eq("id", media_id)
      .single()

    if (mediaError || !media) {
      return new Response(JSON.stringify({ error: "Media not found" }), { status: 404 })
    }

    let userId: string | undefined
    let isGoldMember = false
    let userRole: string | undefined

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user) {
        userId = user.id
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, is_gold_member")
          .eq("id", user.id)
          .single()
        isGoldMember = profile?.is_gold_member || false
        userRole = profile?.role
      }
    }

    let filePath: string
    let requiresWatermark = false
    let maxWidth: number | null = 1200

    if (media.context === "public_gallery") {
      filePath = media.storage_path_derivative || media.storage_path_original
    } else if (media.context === "client_event") {
      if (userId === media.owner_id || userRole === "admin") {
        if (isGoldMember) {
          filePath = media.storage_path_original
          requiresWatermark = false
          maxWidth = null
        } else {
          filePath = media.storage_path_original
          requiresWatermark = true
          maxWidth = null
        }
      } else {
        filePath = media.storage_path_derivative || media.storage_path_original
      }
    } else if (media.context === "seller_design") {
      if (userId === media.owner_id || userRole === "admin") {
        filePath = media.storage_path_original
      } else {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 })
      }
    } else {
      filePath = media.storage_path_original
    }

    const { data: fileData } = await supabase.storage
      .from(media.context === "public_gallery" ? "web-derivatives" : "originals")
      .createSignedUrl(filePath, 3600)

    return new Response(
      JSON.stringify({
        url: fileData?.signedUrl,
        requires_watermark: requiresWatermark,
        max_width: maxWidth,
        is_gold_member: isGoldMember,
      }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
