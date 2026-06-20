import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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

    const imgBytes = await original.arrayBuffer()
    const platformName = "FOTOLUVSTUDIO"
    const watermarkText = `  ${platformName}  `

    const svgWatermark = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
        <text x="0" y="0"
          font-family="Arial, sans-serif"
          font-size="24"
          font-weight="bold"
          fill="rgba(255,255,255,0.20)"
          transform="rotate(-25, 100, 50)"
          text-anchor="middle"
          dominant-baseline="central"
        >
          ${watermarkText}
        </text>
        <text x="0" y="0"
          font-family="Arial, sans-serif"
          font-size="16"
          font-weight="normal"
          fill="rgba(255,255,255,0.12)"
          transform="rotate(-25, 300, 150)"
          text-anchor="middle"
          dominant-baseline="central"
        >
          ${watermarkText}
        </text>
      </svg>
    `

    const watermarkSvgBase64 = btoa(svgWatermark)
    const watermarkDataUri = `data:image/svg+xml;base64,${watermarkSvgBase64}`

    const watermarkPath = `watermarked/${media.storage_path_original.replace(/\.[^.]+$/, '')}.jpg`

    const ffmpegArgs = [
      "-i", "pipe:0",
      "-vf", `movie=${watermarkDataUri},scale=400:200[wm];[in][wm]overlay=format=rgb:shortest=1:repeat=1000:x=0:y=0`,
      "-q:v", "3",
      "-y", watermarkPath,
    ]

    const cmd = new Deno.Command("ffmpeg", {
      args: ffmpegArgs,
      stdin: "piped",
      stdout: "piped",
      stderr: "piped",
    })

    const process = cmd.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new Uint8Array(imgBytes))
    await writer.close()

    const { success, stderr } = await process.output()

    if (!success) {
      const fallbackPath = `watermarked/${media.storage_path_original}`
      const { error: uploadError } = await supabase.storage
        .from("web-derivatives")
        .upload(fallbackPath, original, {
          contentType: original.type,
          upsert: true,
        })

      if (uploadError) {
        return new Response(JSON.stringify({ error: uploadError.message }), { status: 500 })
      }

      await supabase
        .from("media")
        .update({ storage_path_derivative: fallbackPath, watermark_tile_applied: true })
        .eq("id", media_id)

      return new Response(
        JSON.stringify({ success: true, path: fallbackPath, note: "ffmpeg unavailable, stored as-is" }),
        { headers: { "Content-Type": "application/json" } }
      )
    }

    const watermarkedBytes = await Deno.readFile(watermarkPath)
    const { error: uploadError } = await supabase.storage
      .from("web-derivatives")
      .upload(watermarkPath, watermarkedBytes, {
        contentType: "image/jpeg",
        upsert: true,
      })

    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), { status: 500 })
    }

    await supabase
      .from("media")
      .update({ storage_path_derivative: watermarkPath, watermark_tile_applied: true })
      .eq("id", media_id)

    return new Response(
      JSON.stringify({ success: true, path: watermarkPath }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
