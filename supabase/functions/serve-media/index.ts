import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req: Request) => {
  try {
    const { media_id, tier_id } = await req.json()
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
    let maxWidth: number | null = null

    const isOwnerOrAdmin = userId === media.owner_id || userRole === "admin"

    if (tier_id) {
      const { data: tier } = await supabase
        .from("download_tiers")
        .select("*")
        .eq("id", tier_id)
        .single()

      if (tier) {
        const tierLocked = !tier.is_free_tier

        if (isOwnerOrAdmin) {
          filePath = media.storage_path_original
          requiresWatermark = false
        } else if (isGoldMember) {
          filePath = media.storage_path_original
          requiresWatermark = false
        } else {
          if (media.context === "client_event") {
            if (tierLocked) {
              filePath = media.storage_path_original
              requiresWatermark = true
            } else {
              filePath = media.storage_path_derivative || media.storage_path_original
            }
          } else {
            if (tierLocked) {
              return new Response(
                JSON.stringify({
                  error: "locked_tier",
                  message: "This resolution requires Gold Membership",
                  requires_upgrade: true,
                }),
                { status: 403 }
              )
            }
            filePath = media.storage_path_derivative || media.storage_path_original
          }
        }

        return new Response(
          JSON.stringify({
            url: filePath,
            requires_watermark: requiresWatermark,
            max_width: null,
            is_gold_member: isGoldMember,
            tier: { name: tier.tier_name, width: tier.width_px, height: tier.height_px },
          }),
          { headers: { "Content-Type": "application/json" } }
        )
      }
    }

    if (media.context === "public_gallery") {
      filePath = media.storage_path_derivative || media.storage_path_original
      if (!isGoldMember && !isOwnerOrAdmin) {
        requiresWatermark = true
      }
    } else if (media.context === "client_event") {
      if (isOwnerOrAdmin || isGoldMember) {
        filePath = media.storage_path_original
        requiresWatermark = false
      } else {
        filePath = media.storage_path_original
        requiresWatermark = true
      }
    } else if (media.context === "seller_design") {
      if (isOwnerOrAdmin) {
        filePath = media.storage_path_original
        requiresWatermark = false
      } else if (isGoldMember) {
        filePath = media.storage_path_original
        requiresWatermark = false
      } else {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 })
      }
    } else {
      filePath = media.storage_path_original
    }

    return new Response(
      JSON.stringify({
        url: filePath,
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
