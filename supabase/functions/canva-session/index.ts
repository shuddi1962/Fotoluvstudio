import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req: Request) => {
  try {
    const { media_id, design_name } = await req.json()
    const authHeader = req.headers.get("Authorization") || ""
    const token = authHeader.replace("Bearer ", "")

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const { data: media } = await supabase
      .from("media")
      .select("*")
      .eq("id", media_id)
      .single()

    if (!media) {
      return new Response(JSON.stringify({ error: "Media not found" }), { status: 404 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_gold_member, role")
      .eq("id", user.id)
      .single()

    const isGoldMember = profile?.is_gold_member || false
    const isOwnerOrAdmin = user.id === media.owner_id || profile?.role === "admin"
    const sourceIsWatermarked = !isGoldMember && !isOwnerOrAdmin

    const designUrl = sourceIsWatermarked
      ? media.storage_path_derivative || media.storage_path_original
      : media.storage_path_original

    const canvaApiKey = Deno.env.get("CANVA_API_KEY")
    const canvaApiSecret = Deno.env.get("CANVA_API_SECRET")

    if (!canvaApiKey || !canvaApiSecret) {
      return new Response(
        JSON.stringify({
          error: "canva_not_configured",
          message: "Canva integration is not configured. Please contact the administrator.",
        }),
        { status: 501 }
      )
    }

    const tokenRes = await fetch("https://api.canva.com/rest/v1/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: canvaApiKey,
        client_secret: canvaApiSecret,
      }),
    })

    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) {
      return new Response(JSON.stringify({ error: "Failed to authenticate with Canva" }), { status: 500 })
    }

    const importRes = await fetch("https://api.canva.com/rest/v1/imports", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        asset_type: "image",
        name: design_name || media.title || "Untitled Design",
        url: designUrl,
      }),
    })

    const importData = await importRes.json()

    const editSessionRes = await fetch("https://api.canva.com/rest/v1/edit/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        design_id: importData?.result?.design_id || "new",
        design_version: 1,
      }),
    })

    const sessionData = await editSessionRes.json()

    await supabase.from("media_edits").insert({
      media_id: media_id,
      edited_by: user.id,
      tool_used: "canva",
      source_was_watermarked: sourceIsWatermarked,
    })

    return new Response(
      JSON.stringify({
        success: true,
        session_url: sessionData?.result?.url || "",
        design_id: importData?.result?.design_id || null,
        access_token: tokenData.access_token,
        source_was_watermarked: sourceIsWatermarked,
      }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
