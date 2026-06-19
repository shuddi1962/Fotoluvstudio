const PICSUM = (seed: string, w = 800, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

const PHOTOS = [
  { id: 'demo-1', title: 'Mountain Serenity', src: PICSUM('mountain', 800, 1000), w: 800, h: 1000 },
  { id: 'demo-2', title: 'Coastal Dreams', src: PICSUM('coastal', 800, 600), w: 800, h: 600 },
  { id: 'demo-3', title: 'Urban Lights', src: PICSUM('urban', 800, 900), w: 800, h: 900 },
  { id: 'demo-4', title: 'Forest Canopy', src: PICSUM('forest', 800, 700), w: 800, h: 700 },
  { id: 'demo-5', title: 'Golden Hour', src: PICSUM('golden', 800, 800), w: 800, h: 800 },
  { id: 'demo-6', title: 'Architectural Wonder', src: PICSUM('architecture', 800, 1000), w: 800, h: 1000 },
  { id: 'demo-7', title: 'Wildflower Meadow', src: PICSUM('wildflower', 800, 600), w: 800, h: 600 },
  { id: 'demo-8', title: 'City Reflections', src: PICSUM('city', 800, 900), w: 800, h: 900 },
  { id: 'demo-9', title: 'Ocean View', src: PICSUM('ocean', 800, 700), w: 800, h: 700 },
  { id: 'demo-10', title: 'Morning Mist', src: PICSUM('mist', 800, 850), w: 800, h: 850 },
  { id: 'demo-11', title: 'Desert Dunes', src: PICSUM('desert', 800, 650), w: 800, h: 650 },
  { id: 'demo-12', title: 'Starry Night', src: PICSUM('starry', 800, 950), w: 800, h: 950 },
]

const FASHION = [
  { id: 'fashion-1', title: 'Spring Elegance', src: PICSUM('spring-fashion', 600, 800), w: 600, h: 800 },
  { id: 'fashion-2', title: 'Urban Chic', src: PICSUM('urban-fashion', 600, 800), w: 600, h: 800 },
  { id: 'fashion-3', title: 'Casual Luxe', src: PICSUM('casual-fashion', 600, 800), w: 600, h: 800 },
  { id: 'fashion-4', title: 'Modern Silhouette', src: PICSUM('modern-fashion', 600, 800), w: 600, h: 800 },
]

const PRODUCTS = [
  { id: 'sp-1', name: 'Canvas Print', price: 39.99, src: PICSUM('canvas-print', 400, 400), category: 'Wall Art' },
  { id: 'sp-2', name: 'Framed Poster', price: 49.99, src: PICSUM('framed-poster', 400, 400), category: 'Wall Art' },
  { id: 'sp-3', name: 'Premium T-Shirt', price: 29.99, src: PICSUM('tshirt', 400, 400), category: 'Apparel' },
  { id: 'sp-4', name: 'Coffee Mug', price: 14.99, src: PICSUM('coffee-mug', 400, 400), category: 'Home Decor' },
  { id: 'sp-5', name: 'Throw Pillow', price: 24.99, src: PICSUM('throw-pillow', 400, 400), category: 'Home Decor' },
  { id: 'sp-6', name: 'Tote Bag', price: 19.99, src: PICSUM('tote-bag', 400, 400), category: 'Lifestyle' },
  { id: 'sp-7', name: 'Phone Case', price: 12.99, src: PICSUM('phone-case', 400, 400), category: 'Lifestyle' },
  { id: 'sp-8', name: 'Greeting Cards', price: 8.99, src: PICSUM('greeting-cards', 400, 400), category: 'Stationery' },
]

const COLLECTIONS_DATA = [
  { id: 'dc-1', title: 'Landscapes of the World', description: 'Breathtaking vistas from every corner of the globe.', src: PICSUM('landscape-collection', 800, 450) },
  { id: 'dc-2', title: 'Urban Architecture', description: 'The beauty of modern and classical city design.', src: PICSUM('urban-collection', 800, 450) },
  { id: 'dc-3', title: 'Wildlife & Nature', description: 'Intimate encounters with the natural world.', src: PICSUM('nature-collection', 800, 450) },
  { id: 'dc-4', title: 'Abstract Visions', description: 'Where photography meets fine art.', src: PICSUM('abstract-collection', 800, 450) },
  { id: 'dc-5', title: 'Travel & Adventure', description: 'Journeys captured through the lens.', src: PICSUM('travel-collection', 800, 450) },
  { id: 'dc-6', title: 'Portrait Stories', description: 'Faces and expressions that tell a thousand words.', src: PICSUM('portrait-collection', 800, 450) },
]

const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Gold Member', text: 'The print quality is outstanding. I\'ve ordered canvas prints of my favorite photos and they look stunning on my walls.', rating: 5, avatar: PICSUM('avatar-woman-1', 100, 100) },
  { name: 'James K.', role: 'Artist', text: 'As a photographer, this platform has been incredible for reaching new customers. The print-on-demand setup was seamless.', rating: 5, avatar: PICSUM('avatar-man-1', 100, 100) },
  { name: 'Emma L.', role: 'Collector', text: 'I love discovering new artists here. The curated collections make it easy to find pieces that match my style perfectly.', rating: 5, avatar: PICSUM('avatar-woman-2', 100, 100) },
  { name: 'David R.', role: 'Interior Designer', text: 'Fotoluvstudio is my go-to for sourcing artwork for clients. The variety and quality are unmatched.', rating: 4, avatar: PICSUM('avatar-man-2', 100, 100) },
]

const ARTISTS = [
  { name: 'Elena Vogt', handle: '@elenavogt', bio: 'Landscape & nature photographer', avatar: PICSUM('avatar-woman-1', 200, 200), photo: PICSUM('artist-elena', 400, 400) },
  { name: 'Marcus Chen', handle: '@marcuschen', bio: 'Urban & architectural photography', avatar: PICSUM('avatar-man-1', 200, 200), photo: PICSUM('artist-marcus', 400, 400) },
  { name: 'Aisha Patel', handle: '@aishapatel', bio: 'Fashion & portrait photographer', avatar: PICSUM('avatar-woman-2', 200, 200), photo: PICSUM('artist-aisha', 400, 400) },
  { name: 'Oliver West', handle: '@oliverwest', bio: 'Wildlife & adventure photography', avatar: PICSUM('avatar-man-2', 200, 200), photo: PICSUM('artist-oliver', 400, 400) },
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
  return COLLECTIONS_DATA.map((c) => ({
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

export { PHOTOS, FASHION, PRODUCTS, COLLECTIONS_DATA, TESTIMONIALS, ARTISTS, STATS }
