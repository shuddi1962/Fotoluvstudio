export const BRAND = {
  primaryBg: '#FAFAF7',
  accent: '#2D6E5E',
  gold: '#B68A2E',
  goldBg: '#FBF3DF',
  fontHeadline: "'Fraunces', serif",
  fontUI: "'Inter', sans-serif",
}

export const SHOP_CATEGORIES = [
  { slug: 'wall_art', name: 'Wall Art' },
  { slug: 'home_decor', name: 'Home Decor' },
  { slug: 'apparel', name: 'Apparel' },
  { slug: 'lifestyle', name: 'Lifestyle' },
  { slug: 'stationery', name: 'Stationery' },
] as const

export const SUB_CATEGORIES = {
  wall_art: ['Canvas Prints', 'Framed Prints', 'Metal Prints', 'Acrylic Prints', 'Wood Prints', 'Posters', 'Tapestries'],
  home_decor: ['Throw Pillows', 'Blankets', 'Duvet Covers', 'Shower Curtains', 'Coffee Mugs', 'Towels'],
  apparel: ["Men's T-Shirts", "Women's T-Shirts", 'Hoodies/Sweatshirts', "Kids' Tees", 'Tank Tops'],
  lifestyle: ['Tote Bags', 'Phone Cases', 'Jigsaw Puzzles', 'Yoga Mats', 'Carry-All Pouches'],
  stationery: ['Greeting Cards', 'Notebooks', 'Stickers'],
} as const

export const ACCESS_TIERS = {
  anonymous: { watermark: true, maxWidth: 1200 },
  client: { watermark: true, maxWidth: null },
  gold_member: { watermark: false, maxWidth: null },
} as const
