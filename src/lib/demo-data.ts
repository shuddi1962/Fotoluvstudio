import { getCuratedPhotos, getFashionPhotos, getProductPhotos, getVideos, imgUrl, vidThumb, vidSrc } from "./pexels"
import type { PexVideo } from "./pexels"

// ── Fallback SVGs (zero network, always work) ──
const SVG = (f: string) => `/images/${f}.svg`
const PHOTO_SVGS = [
  SVG('placeholder-1'), SVG('placeholder-2'), SVG('placeholder-3'),
  SVG('placeholder-4'), SVG('placeholder-5'), SVG('placeholder-1'),
  SVG('placeholder-2'), SVG('placeholder-3'), SVG('placeholder-4'),
  SVG('placeholder-5'), SVG('placeholder-1'), SVG('placeholder-2'),
]
export { PHOTO_SVGS }
const FASHION_SVG = SVG('placeholder-fashion')
const PRODUCT_SVG = SVG('placeholder-6')
const COLLECTION_SVG = SVG('placeholder-collection')
const AVATAR_SVG = SVG('placeholder-avatar')

// ── Shared types ──
export interface DemoMedia {
  id: string; title: string; storage_path_derivative: string; width_px: number; height_px: number
  is_featured: boolean; media_type: string; context: string; owner_id: string
  storage_path_original: string; tags: string[] | null; created_at: string
}

export interface DemoVideo {
  id: string; title: string; thumbnail: string; src: string; width: number; height: number; duration: number
}

function toMedia(id: string, title: string, src: string, w: number, h: number, featured = false): DemoMedia {
  return {
    id, title, storage_path_derivative: src, storage_path_original: src,
    width_px: w, height_px: h, is_featured: featured,
    media_type: 'photo', context: 'public_gallery',
    owner_id: '', tags: null, created_at: new Date().toISOString(),
  }
}

const PHOTO_TITLES = [
  'Mountain Serenity', 'Coastal Dreams', 'Urban Lights',
  'Forest Canopy', 'Golden Hour', 'Architectural Wonder',
  'Wildflower Meadow', 'City Reflections', 'Ocean View',
  'Morning Mist', 'Desert Dunes', 'Starry Night',
]

// ── PUBLIC EXPORTS ──

export async function getDemoMedia(count = 12): Promise<DemoMedia[]> {
  const pexels = await getCuratedPhotos(count)
  if (pexels.length > 0) {
    return pexels.map((p, i) =>
      toMedia(`pexel-${p.id}`, p.alt || PHOTO_TITLES[i] || 'Photo', imgUrl(p, 'large2x'), p.width, p.height, i < 6)
    )
  }
  return PHOTO_SVGS.slice(0, count).map((src, i) =>
    toMedia(`demo-${i + 1}`, PHOTO_TITLES[i], src, 800, [1000, 600, 900, 700, 800, 1000, 600, 900, 700, 850, 650, 950][i], i < 6)
  )
}

const COLLECTION_DATA = [
  { title: 'Landscapes of the World', desc: 'Breathtaking vistas from every corner of the globe.' },
  { title: 'Urban Architecture', desc: 'The beauty of modern and classical city design.' },
  { title: 'Wildlife & Nature', desc: 'Intimate encounters with the natural world.' },
  { title: 'Abstract Visions', desc: 'Where photography meets fine art.' },
  { title: 'Travel & Adventure', desc: 'Journeys captured through the lens.' },
  { title: 'Portrait Stories', desc: 'Faces and expressions that tell a thousand words.' },
]

export async function getDemoCollections() {
  const pexels = await getCuratedPhotos(6)
  if (pexels.length > 0) {
    return pexels.map((p, i) => ({
      id: `col-pexel-${p.id}`, title: COLLECTION_DATA[i]?.title || 'Collection',
      description: COLLECTION_DATA[i]?.desc || '',
      cover_media: { storage_path_derivative: imgUrl(p, 'large2x') },
      owner_id: '', created_at: new Date().toISOString(),
    }))
  }
  return COLLECTION_DATA.map((c, i) => ({
    id: `dc-${i + 1}`, title: c.title, description: c.desc,
    cover_media: { storage_path_derivative: COLLECTION_SVG },
    owner_id: '', created_at: new Date().toISOString(),
  }))
}

const PRODUCT_DATA = [
  { name: 'Canvas Print', price: 39.99, cat: 'Wall Art' },
  { name: 'Framed Poster', price: 49.99, cat: 'Wall Art' },
  { name: 'Premium T-Shirt', price: 29.99, cat: 'Apparel' },
  { name: 'Coffee Mug', price: 14.99, cat: 'Home Decor' },
  { name: 'Throw Pillow', price: 24.99, cat: 'Home Decor' },
  { name: 'Tote Bag', price: 19.99, cat: 'Lifestyle' },
  { name: 'Phone Case', price: 12.99, cat: 'Lifestyle' },
  { name: 'Greeting Cards', price: 8.99, cat: 'Stationery' },
]

export async function getDemoProducts() {
  const pexels = await getProductPhotos(8)
  if (pexels.length > 0) {
    return pexels.map((p, i) => ({
      id: `prod-pexel-${p.id}`, seller_price: PRODUCT_DATA[i]?.price || 29.99,
      mockup_url: imgUrl(p, 'large2x'),
      pod_product: { name: PRODUCT_DATA[i]?.name || 'Product' },
      seller_id: '', media_id: '', pod_product_id: '', selected_variant: null,
      is_published: true, created_at: new Date().toISOString(),
    }))
  }
  return PRODUCT_DATA.map((p, i) => ({
    id: `sp-${i + 1}`, seller_price: p.price, mockup_url: PRODUCT_SVG,
    pod_product: { name: p.name },
    seller_id: '', media_id: '', pod_product_id: '', selected_variant: null,
    is_published: true, created_at: new Date().toISOString(),
  }))
}

const FASHION_TITLES = ['Spring Elegance', 'Urban Chic', 'Casual Luxe', 'Modern Silhouette']

export async function getDemoFashionItems() {
  const pexels = await getFashionPhotos(4)
  if (pexels.length > 0) {
    return pexels.map((p, i) => ({
      id: `fash-pexel-${p.id}`, title: FASHION_TITLES[i] || 'Fashion',
      storage_path_derivative: imgUrl(p, 'large2x'), width_px: p.width, height_px: p.height,
      media_type: 'photo', context: 'fashion_showcase', owner_id: '',
      storage_path_original: imgUrl(p, 'original'), is_featured: true, tags: ['fashion'],
      created_at: new Date().toISOString(),
    }))
  }
  return FASHION_TITLES.map((title, i) => ({
    id: `fashion-${i + 1}`, title, storage_path_derivative: FASHION_SVG, width_px: 600, height_px: 800,
    media_type: 'photo', context: 'fashion_showcase', owner_id: '',
    storage_path_original: FASHION_SVG, is_featured: true, tags: null,
    created_at: new Date().toISOString(),
  }))
}

const VIDEO_TITLES = ['Aerial Ocean', 'Forest Timelapse', 'City Drone', 'Mountain Flight', 'River Flow', 'Night Sky']

export async function getDemoVideos(): Promise<DemoVideo[]> {
  const pexels = await getVideos(6)
  if (pexels.length > 0) {
    return pexels.map((v: PexVideo, i: number) => ({
      id: `vid-${v.id}`, title: VIDEO_TITLES[i] || 'Video',
      thumbnail: vidThumb(v), src: vidSrc(v, 'sd'),
      width: v.width, height: v.height, duration: v.duration,
    }))
  }
  return VIDEO_TITLES.map((title, i) => ({
    id: `vid-demo-${i + 1}`, title, thumbnail: PHOTO_SVGS[i % PHOTO_SVGS.length],
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    width: 1080, height: 1920, duration: 15,
  }))
}

// ── STATIC DATA (no async) ──
const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Gold Member', text: 'The print quality is outstanding. I\'ve ordered canvas prints of my favorite photos and they look stunning on my walls.', rating: 5, avatar: AVATAR_SVG },
  { name: 'James K.', role: 'Artist', text: 'As a photographer, this platform has been incredible for reaching new customers. The print-on-demand setup was seamless.', rating: 5, avatar: AVATAR_SVG },
  { name: 'Emma L.', role: 'Collector', text: 'I love discovering new artists here. The curated collections make it easy to find pieces that match my style perfectly.', rating: 5, avatar: AVATAR_SVG },
  { name: 'David R.', role: 'Interior Designer', text: 'Fotoluvstudio is my go-to for sourcing artwork for clients. The variety and quality are unmatched.', rating: 4, avatar: AVATAR_SVG },
]

const ARTISTS_DATA = [
  { name: 'Elena Vogt', handle: '@elenavogt', bio: 'Landscape & nature photographer' },
  { name: 'Marcus Chen', handle: '@marcuschen', bio: 'Urban & architectural photography' },
  { name: 'Aisha Patel', handle: '@aishapatel', bio: 'Fashion & portrait photographer' },
  { name: 'Oliver West', handle: '@oliverwest', bio: 'Wildlife & adventure photography' },
]

const STATS = [
  { value: '10K+', label: 'Photos' },
  { value: '500+', label: 'Artists' },
  { value: '50K+', label: 'Prints Sold' },
  { value: '4.9', label: 'Avg. Rating' },
]

export function getDemoTestimonials() { return TESTIMONIALS }

export async function getDemoArtists() {
  const pexels = await getCuratedPhotos(4)
  if (pexels.length >= 4) {
    return ARTISTS_DATA.map((a, i) => ({
      ...a, avatar: imgUrl(pexels[i], 'large'), photo: imgUrl(pexels[(i + 2) % 4], 'large2x'),
    }))
  }
  return ARTISTS_DATA.map((a, i) => ({
    ...a, avatar: AVATAR_SVG, photo: PHOTO_SVGS[i * 2],
  }))
}

export function getDemoStats() { return STATS }
