const UNSPLASH = (id: string, w = 800, h = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop`

const PHOTOS = [
  { id: 'demo-1', title: 'Mountain Serenity', src: UNSPLASH('photo-1506905925346-21bda4d32df4'), w: 800, h: 1000 },
  { id: 'demo-2', title: 'Coastal Dreams', src: UNSPLASH('photo-1505118380757-91f5f5632de0'), w: 800, h: 600 },
  { id: 'demo-3', title: 'Urban Lights', src: UNSPLASH('photo-1477959858617-67f85cf4f1df'), w: 800, h: 900 },
  { id: 'demo-4', title: 'Forest Canopy', src: UNSPLASH('photo-1441974231531-c6227db76b6e'), w: 800, h: 700 },
  { id: 'demo-5', title: 'Golden Hour', src: UNSPLASH('photo-1469474965088-e8e6ff2c6e8d'), w: 800, h: 800 },
  { id: 'demo-6', title: 'Architectural Wonder', src: UNSPLASH('photo-1480714378408-67cf0d13bc1b'), w: 800, h: 1000 },
  { id: 'demo-7', title: 'Wildflower Meadow', src: UNSPLASH('photo-1472214103451-9374bd1c798e'), w: 800, h: 600 },
  { id: 'demo-8', title: 'City Reflections', src: UNSPLASH('photo-1513635269975-59663e0ac1ad'), w: 800, h: 900 },
  { id: 'demo-9', title: 'Ocean View', src: UNSPLASH('photo-1504198453319-5ce911bafcde'), w: 800, h: 700 },
  { id: 'demo-10', title: 'Morning Mist', src: UNSPLASH('photo-1470071459604-7b8ec44ffd2e'), w: 800, h: 850 },
  { id: 'demo-11', title: 'Desert Dunes', src: UNSPLASH('photo-1501785888041-af3ef285b470'), w: 800, h: 650 },
  { id: 'demo-12', title: 'Starry Night', src: UNSPLASH('photo-1506744038136-46273834b3fb'), w: 800, h: 950 },
]

const FASHION = [
  { id: 'fashion-1', title: 'Spring Elegance', src: UNSPLASH('photo-1525507119028-ed4c629a60a3', 600, 800), w: 600, h: 800 },
  { id: 'fashion-2', title: 'Urban Chic', src: UNSPLASH('photo-1539109135821-8e1f5ab9b4a8', 600, 800), w: 600, h: 800 },
  { id: 'fashion-3', title: 'Casual Luxe', src: UNSPLASH('photo-1515886657613-9f3515b0c78f', 600, 800), w: 600, h: 800 },
  { id: 'fashion-4', title: 'Modern Silhouette', src: UNSPLASH('photo-1469334031218-e382a71b716b', 600, 800), w: 600, h: 800 },
]

const PRODUCTS = [
  { id: 'sp-1', name: 'Canvas Print', price: 39.99, src: UNSPLASH('photo-1513519245088-0e12902e35ca', 400, 400), category: 'Wall Art' },
  { id: 'sp-2', name: 'Framed Poster', price: 49.99, src: UNSPLASH('photo-1578302758063-0ef3e048ca89', 400, 400), category: 'Wall Art' },
  { id: 'sp-3', name: 'Premium T-Shirt', price: 29.99, src: UNSPLASH('photo-1521572163474-6864f9cf17ab', 400, 400), category: 'Apparel' },
  { id: 'sp-4', name: 'Coffee Mug', price: 14.99, src: UNSPLASH('photo-1514228742587-6b4658e1d0b4', 400, 400), category: 'Home Decor' },
  { id: 'sp-5', name: 'Throw Pillow', price: 24.99, src: UNSPLASH('photo-1584100936595-c0654b55a2e2', 400, 400), category: 'Home Decor' },
  { id: 'sp-6', name: 'Tote Bag', price: 19.99, src: UNSPLASH('photo-1597484661643-2f5fef640d6e', 400, 400), category: 'Lifestyle' },
  { id: 'sp-7', name: 'Phone Case', price: 12.99, src: UNSPLASH('photo-1601784551446-20c9e07cdbdb', 400, 400), category: 'Lifestyle' },
  { id: 'sp-8', name: 'Greeting Cards', price: 8.99, src: UNSPLASH('photo-1607344645866-009c320b63e0', 400, 400), category: 'Stationery' },
]

const COLLECTIONS_DATA = [
  { id: 'dc-1', title: 'Landscapes of the World', description: 'Breathtaking vistas from every corner of the globe.', src: UNSPLASH('photo-1506905925346-21bda4d32df4', 800, 450) },
  { id: 'dc-2', title: 'Urban Architecture', description: 'The beauty of modern and classical city design.', src: UNSPLASH('photo-1477959858617-67f85cf4f1df', 800, 450) },
  { id: 'dc-3', title: 'Wildlife & Nature', description: 'Intimate encounters with the natural world.', src: UNSPLASH('photo-1470071459604-7b8ec44ffd2e', 800, 450) },
  { id: 'dc-4', title: 'Abstract Visions', description: 'Where photography meets fine art.', src: UNSPLASH('photo-1469474965088-e8e6ff2c6e8d', 800, 450) },
  { id: 'dc-5', title: 'Travel & Adventure', description: 'Journeys captured through the lens.', src: UNSPLASH('photo-1480714378408-67cf0d13bc1b', 800, 450) },
  { id: 'dc-6', title: 'Portrait Stories', description: 'Faces and expressions that tell a thousand words.', src: UNSPLASH('photo-1507003211169-0a1dd7228f2d', 800, 450) },
]

const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Gold Member', text: 'The print quality is outstanding. I\'ve ordered canvas prints of my favorite photos and they look stunning on my walls.', rating: 5, avatar: UNSPLASH('photo-1494790108377-be9c29b29330', 100, 100) },
  { name: 'James K.', role: 'Artist', text: 'As a photographer, this platform has been incredible for reaching new customers. The print-on-demand setup was seamless.', rating: 5, avatar: UNSPLASH('photo-1507003211169-0a1dd7228f2d', 100, 100) },
  { name: 'Emma L.', role: 'Collector', text: 'I love discovering new artists here. The curated collections make it easy to find pieces that match my style perfectly.', rating: 5, avatar: UNSPLASH('photo-1438761681033-6461ffad8d80', 100, 100) },
  { name: 'David R.', role: 'Interior Designer', text: 'Fotoluvstudio is my go-to for sourcing artwork for clients. The variety and quality are unmatched.', rating: 4, avatar: UNSPLASH('photo-1472099645785-5658abf4ff4e', 100, 100) },
]

const ARTISTS = [
  { name: 'Elena Vogt', handle: '@elenavogt', bio: 'Landscape & nature photographer', avatar: UNSPLASH('photo-1494790108377-be9c29b29330', 200, 200), photo: UNSPLASH('photo-1506905925346-21bda4d32df4', 400, 400) },
  { name: 'Marcus Chen', handle: '@marcuschen', bio: 'Urban & architectural photography', avatar: UNSPLASH('photo-1507003211169-0a1dd7228f2d', 200, 200), photo: UNSPLASH('photo-1477959858617-67f85cf4f1df', 400, 400) },
  { name: 'Aisha Patel', handle: '@aishapatel', bio: 'Fashion & portrait photographer', avatar: UNSPLASH('photo-1438761681033-6461ffad8d80', 200, 200), photo: UNSPLASH('photo-1525507119028-ed4c629a60a3', 400, 400) },
  { name: 'Oliver West', handle: '@oliverwest', bio: 'Wildlife & adventure photography', avatar: UNSPLASH('photo-1472099645785-5658abf4ff4e', 200, 200), photo: UNSPLASH('photo-1470071459604-7b8ec44ffd2e', 400, 400) },
]

const STATS = [
  { value: '10K+', label: 'Photos' },
  { value: '500+', label: 'Artists' },
  { value: '50K+', label: 'Prints Sold' },
  { value: '4.9', label: 'Avg. Rating' },
]

export interface DemoMedia {
  id: string; title: string; storage_path_derivative: string; width_px: number; height_px: number; is_featured: boolean; media_type: string; context: string; owner_id: string; storage_path_original: string; tags: string[] | null; created_at: string
}

function toDemoMedia(p: typeof PHOTOS[number], i: number): DemoMedia {
  return {
    id: p.id, title: p.title,
    storage_path_derivative: p.src, storage_path_original: p.src,
    width_px: p.w, height_px: p.h, is_featured: i < 6,
    media_type: 'photo', context: 'public_gallery',
    owner_id: '', tags: null, created_at: new Date().toISOString(),
  }
}

export function getDemoMedia(count = 12): DemoMedia[] {
  return PHOTOS.slice(0, count).map(toDemoMedia)
}

export function getDemoCollections() {
  return COLLECTIONS_DATA.map((c, i) => ({
    id: c.id, title: c.title, description: c.description,
    cover_media: { storage_path_derivative: c.src },
    owner_id: '', created_at: new Date().toISOString(),
  }))
}

export function getDemoProducts() {
  return PRODUCTS.map((p) => ({
    id: p.id, seller_price: p.price, mockup_url: p.src,
    pod_product: { name: p.name },
    seller_id: '', media_id: '', pod_product_id: '', selected_variant: null, is_published: true, created_at: new Date().toISOString(),
  }))
}

export function getDemoFashionItems() {
  return FASHION.map((f) => ({
    id: f.id, title: f.title, storage_path_derivative: f.src, width_px: f.w, height_px: f.h,
    media_type: 'photo', context: 'fashion_showcase', owner_id: '', storage_path_original: f.src, is_featured: true, tags: null, created_at: new Date().toISOString(),
  }))
}

export function getDemoTestimonials() {
  return TESTIMONIALS
}

export function getDemoArtists() {
  return ARTISTS
}

export function getDemoStats() {
  return STATS
}

export function getDemoPhotos() {
  return PHOTOS
}

export function getDemoFashionPhotos() {
  return FASHION
}

export { PHOTOS, FASHION, PRODUCTS, COLLECTIONS_DATA, TESTIMONIALS, ARTISTS, STATS }
