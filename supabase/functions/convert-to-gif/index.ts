import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req: Request) => {
  try {
    const { media_id, start_time, duration_sec, tier_id } = await req.json()
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

    if (!media || media.media_type !== "video") {
      return new Response(JSON.stringify({ error: "Media not found or not a video" }), { status: 404 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_gold_member, role")
      .eq("id", user.id)
      .single()

    const isGoldMember = profile?.is_gold_member || false
    const isOwnerOrAdmin = user.id === media.owner_id || profile?.role === "admin"

    let sourcePath = media.storage_path_original
    let sourceIsWatermarked = false
    let targetWidth = 640
    let targetHeight = 480

    if (tier_id) {
      const { data: tier } = await supabase
        .from("download_tiers")
        .select("*")
        .eq("id", tier_id)
        .single()

      if (tier) {
        targetWidth = tier.width_px
        targetHeight = tier.height_px

        if (!tier.is_free_tier && !isGoldMember && !isOwnerOrAdmin) {
          if (media.context === "client_event") {
            sourcePath = media.storage_path_original
            sourceIsWatermarked = true
          } else {
            return new Response(
              JSON.stringify({
                error: "locked_tier",
                message: "This resolution requires Gold Membership",
                requires_upgrade: true,
              }),
              { status: 403 }
            )
          }
        }
      }
    }

    if (!isGoldMember && !isOwnerOrAdmin) {
      sourcePath = media.storage_path_derivative || media.storage_path_original
      sourceIsWatermarked = true
    }

    const outputPath = `gifs/${media_id}/${crypto.randomUUID()}.gif`

    const ffmpegArgs = [
      "-i", sourcePath,
      "-ss", String(start_time || 0),
      "-t", String(duration_sec || 3),
      "-vf", `fps=10,scale=${targetWidth}:${targetHeight}:flags=lanczos`,
      "-loop", "0",
      "-y", outputPath,
    ]

    const cmd = new Deno.Command("ffmpeg", { args: ffmpegArgs })
    const { success, stderr } = await cmd.output()

    if (!success) {
      const errorMsg = new TextDecoder().decode(stderr)
      return new Response(JSON.stringify({ error: "GIF conversion failed", details: errorMsg }), { status: 500 })
    }

    const gifBytes = await Deno.readFile(outputPath)
    const { error: uploadError } = await supabase.storage
      .from("web-derivatives")
      .upload(outputPath, gifBytes, { contentType: "image/gif", upsert: true })

    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), { status: 500 })
    }

    await supabase.from("media_edits").insert({
      media_id: media_id,
      edited_by: user.id,
      tool_used: "convert_to_gif",
      result_storage_path: outputPath,
      source_was_watermarked: sourceIsWatermarked,
    })

    const { data: signedUrl } = await supabase.storage
      .from("web-derivatives")
      .createSignedUrl(outputPath, 3600)

    return new Response(
      JSON.stringify({
        success: true,
        url: signedUrl?.signedUrl || "",
        path: outputPath,
        width: targetWidth,
        height: targetHeight,
        source_was_watermarked: sourceIsWatermarked,
      }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
