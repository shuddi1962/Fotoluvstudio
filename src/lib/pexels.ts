const KEY = "GH735sp9bohSxSm2PnTFewYGjsZvGS2UoE0JzLCMgFgG2bAV0UTihSVn"
const PHOTO_API = "https://api.pexels.com/v1"
const VIDEO_API = "https://api.pexels.com/videos"

interface PexPhoto {
  id: number; width: number; height: number
  src: { medium: string; large: string; large2x: string; original: string }
  alt: string
}

interface PexVideo {
  id: number; width: number; height: number; duration: number
  image: string
  video_files: { link: string; quality: string; width: number; height: number }[]
}

async function get<T>(url: string): Promise<T[]> {
  try {
    const ctrl = new AbortController()
    const id = setTimeout(() => ctrl.abort(), 8000)
    const res = await fetch(url, { headers: { Authorization: KEY }, signal: ctrl.signal })
    clearTimeout(id)
    if (!res.ok) return []
    const json = await res.json()
    if (json.photos) return json.photos as T[]
    if (json.videos) return json.videos as T[]
    return []
  } catch {
    return []
  }
}

// ── module‑level caches (shared across requests in same process) ──
let _curated: PexPhoto[] | null = null
let _fashion: PexPhoto[] | null = null
let _products: PexPhoto[] | null = null
let _videos: PexVideo[] | null = null

export async function getCuratedPhotos(n = 12): Promise<PexPhoto[]> {
  if (_curated) return _curated.slice(0, n)
  _curated = await get<PexPhoto>(`${PHOTO_API}/curated?per_page=20`)
  return (_curated || []).slice(0, n)
}

export async function getFashionPhotos(n = 4): Promise<PexPhoto[]> {
  if (_fashion) return _fashion.slice(0, n)
  _fashion = await get<PexPhoto>(`${PHOTO_API}/search?query=fashion+editorial&per_page=8&orientation=portrait`)
  return (_fashion || []).slice(0, n)
}

export async function getProductPhotos(n = 8): Promise<PexPhoto[]> {
  if (_products) return _products.slice(0, n)
  _products = await get<PexPhoto>(`${PHOTO_API}/search?query=lifestyle+product+minimal&per_page=12&orientation=square`)
  return (_products || []).slice(0, n)
}

export async function getVideos(n = 6): Promise<PexVideo[]> {
  if (_videos) return _videos.slice(0, n)
  _videos = await get<PexVideo>(`${VIDEO_API}/search?query=nature+aerial&per_page=8&orientation=portrait`)
  return (_videos || []).slice(0, n)
}

export function imgUrl(p: PexPhoto, size: 'medium' | 'large' | 'large2x' | 'original' = 'large2x'): string {
  return p.src[size]
}

export function vidThumb(v: PexVideo): string {
  return v.image
}

export function vidSrc(v: PexVideo, quality: 'hd' | 'sd' = 'hd'): string {
  const file = v.video_files.find((f) => f.quality === quality) || v.video_files[0]
  return file?.link || ''
}

export type { PexPhoto, PexVideo }
