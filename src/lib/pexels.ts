const PEXELS_API_KEY = "GH735sp9bohSxSm2PnTFewYGjsZvGS2UoE0JzLCMgFgG2bAV0UTihSVn"
const BASE = "https://api.pexels.com/v1"
const BASE_VIDEO = "https://api.pexels.com/videos"

interface PexelsPhoto {
  id: number
  width: number
  height: number
  src: {
    medium: string
    large: string
    large2x: string
    original: string
    portrait: string
    landscape: string
    tiny: string
  }
  alt: string
  photographer: string
}

interface PexelsVideo {
  id: number
  width: number
  height: number
  duration: number
  image: string
  video_files: { link: string; quality: string; width: number; height: number }[]
}

async function fetchFromPexels<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { Authorization: PEXELS_API_KEY },
      next: { revalidate: 86400 },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

let cachedPhotos: PexelsPhoto[] | null = null
let cachedFashion: PexelsPhoto[] | null = null
let cachedVideos: PexelsVideo[] | null = null
let cachedProducts: PexelsPhoto[] | null = null

export async function getCuratedPhotos(count = 12): Promise<PexelsPhoto[]> {
  if (cachedPhotos) return cachedPhotos.slice(0, count)
  const data = await fetchFromPexels<{ photos: PexelsPhoto[] }>(
    `${BASE}/curated?per_page=${Math.max(count, 20)}`
  )
  cachedPhotos = data?.photos || []
  return cachedPhotos.slice(0, count)
}

export async function getFashionPhotos(count = 4): Promise<PexelsPhoto[]> {
  if (cachedFashion) return cachedFashion.slice(0, count)
  const data = await fetchFromPexels<{ photos: PexelsPhoto[] }>(
    `${BASE}/search?query=fashion+portrait&per_page=${Math.max(count, 8)}&orientation=portrait`
  )
  cachedFashion = data?.photos || []
  return cachedFashion.slice(0, count)
}

export async function getProductPhotos(count = 8): Promise<PexelsPhoto[]> {
  if (cachedProducts) return cachedProducts.slice(0, count)
  const data = await fetchFromPexels<{ photos: PexelsPhoto[] }>(
    `${BASE}/search?query=lifestyle+product&per_page=${Math.max(count, 12)}&orientation=square`
  )
  cachedProducts = data?.photos || []
  return cachedProducts.slice(0, count)
}

export async function getVideos(count = 4): Promise<PexelsVideo[]> {
  if (cachedVideos) return cachedVideos.slice(0, count)
  const data = await fetchFromPexels<{ videos: PexelsVideo[] }>(
    `${BASE_VIDEO}/search?query=nature&per_page=${Math.max(count, 8)}`
  )
  cachedVideos = data?.videos || []
  return cachedVideos.slice(0, count)
}

export function photoUrl(p: PexelsPhoto, size: 'medium' | 'large' | 'large2x' | 'original' = 'large2x'): string {
  return p.src[size]
}

export function videoThumbnailUrl(v: PexelsVideo): string {
  return v.image
}
