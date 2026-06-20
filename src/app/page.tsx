import Link from "next/link"
import Image from "next/image"
import PublicLayout from "@/components/layout/PublicLayout"
import HomeGalleryClient from "@/components/gallery/HomeGalleryClient"
import HeroCarousel from "@/components/hero/HeroCarousel"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getDemoMedia, getDemoCollections, getDemoProducts, getDemoVideos, getDemoTestimonials, getDemoArtists, getDemoStats } from "@/lib/demo-data"
import { SHOP_CATEGORIES } from "@/lib/constants"

async function getFeatured() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )

  const { data: media } = await supabase
    .from("media").select("*").eq("context", "public_gallery").eq("is_featured", true)
    .order("created_at", { ascending: false }).limit(6)

  const { data: collections } = await supabase
    .from("collections").select("*, cover_media:media(storage_path_derivative)").limit(6)

  const { data: products } = await supabase
    .from("seller_products").select("*, pod_product:pod_products(name), media:media(storage_path_derivative)")
    .eq("is_published", true).limit(8)

  return {
    media: media?.length ? media : await getDemoMedia(6),
    collections: collections?.length ? collections : await getDemoCollections(),
    products: products?.length ? products : await getDemoProducts(),
    videos: await getDemoVideos(),
  }
}

const categoryIcons: Record<string, string> = {
  wall_art: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  home_decor: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  apparel: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
  lifestyle: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  stationery: "M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13",
}

const categoryGradients: Record<string, string> = {
  wall_art: "from-amber-100/60 to-amber-200/40",
  home_decor: "from-emerald-100/60 to-emerald-200/40",
  apparel: "from-blue-100/60 to-blue-200/40",
  lifestyle: "from-purple-100/60 to-purple-200/40",
  stationery: "from-rose-100/60 to-rose-200/40",
}

const sectionHeading = (title: string, link?: { href: string; label: string }) => (
  <div className="flex items-center justify-between mb-8">
    <h2 className="text-2xl md:text-3xl font-headline">{title}</h2>
    {link && <Link href={link.href} className="text-sm text-accent hover:underline font-medium">{link.label} &rarr;</Link>}
  </div>
)

export default async function HomePage() {
  const { media, collections, products, videos } = await getFeatured()
  const testimonials = getDemoTestimonials()
  const artists = await getDemoArtists()
  const stats = getDemoStats()

  return (
    <PublicLayout>
      {/* ═══════════ HERO CAROUSEL ═══════════ */}
      <HeroCarousel />

      {/* ═══════════ STATS ═══════════ */}
      <section className="border-y border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-headline font-bold text-accent">{s.value}</div>
                <div className="text-sm text-text-muted mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ EXPLORE CATEGORIES ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {sectionHeading("Explore Categories", { href: "/shop", label: "Shop all" })}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {SHOP_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop/${cat.slug}`}
              className={`card p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group bg-gradient-to-br ${categoryGradients[cat.slug]}`}
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/70 flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all">
                <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={categoryIcons[cat.slug]} />
                </svg>
              </div>
              <h3 className="font-headline font-semibold group-hover:text-accent transition-colors">{cat.name}</h3>
              <p className="text-xs text-text-muted mt-1">Browse collection</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ FEATURED GALLERY ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {sectionHeading("Featured Photography", { href: "/gallery", label: "View all" })}
        <HomeGalleryClient media={media} videos={[]} />
      </section>

      {/* ═══════════ SHOP BEST SELLERS ═══════════ */}
      {products.length > 0 && (
        <section className="bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {sectionHeading("Shop Best Sellers", { href: "/shop", label: "Shop all" })}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((p: any) => (
                <Link key={p.id} href={`/shop/product/${p.id}`} className="card overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="aspect-square relative bg-gradient-to-br from-accent/10 to-gold-bg/20 overflow-hidden">
                    {p.mockup_url && (
                      <Image src={p.mockup_url} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-text-muted truncate">{p.pod_product?.name || "Product"}</p>
                    <p className="font-semibold text-accent">${Number(p.seller_price).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ VIDEO SHOWCASE ═══════════ */}
      {videos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {sectionHeading("Video Showcase", { href: "/videos", label: "View all videos" })}
          <HomeGalleryClient media={[]} videos={videos} />
        </section>
      )}

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-headline mb-4">How It Works</h2>
            <p className="text-text-muted">From discovery to delivery — bringing art into your life is simple.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Browse & Discover", desc: "Explore thousands of photographs and designs from talented artists around the world.", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
              { step: "02", title: "Choose Your Product", desc: "Select from canvas prints, framed art, apparel, home decor, and more premium items.", icon: "M5 13l4 4L19 7" },
              { step: "03", title: "Order & Enjoy", desc: "We print and ship worldwide with premium quality. Your satisfaction is guaranteed.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((item) => (
              <div key={item.step} className="card p-8 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <span className="text-xs font-mono text-accent tracking-widest">{item.step}</span>
                <h3 className="font-headline text-lg mt-2 mb-2">{item.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CURATED COLLECTIONS ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {sectionHeading("Curated Collections", { href: "/collections", label: "View all" })}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((c: any) => (
            <Link key={c.id} href={`/collections/${c.id}`} className="card overflow-hidden group hover:shadow-md transition-shadow">
              <div className="aspect-[16/9] relative bg-gradient-to-br from-accent/20 to-gold-bg/30 overflow-hidden">
                {c.cover_media?.storage_path_derivative && (
                  <Image src={c.cover_media.storage_path_derivative} alt={c.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
              </div>
              <div className="p-5">
                <h3 className="font-headline font-semibold text-lg group-hover:text-accent transition-colors">{c.title}</h3>
                {c.description && <p className="text-sm text-text-muted mt-1 line-clamp-2">{c.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ ARTIST SPOTLIGHT ═══════════ */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {sectionHeading("Artist Spotlight", { href: "/sellers", label: "Meet all artists" })}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {artists.map((a) => (
              <Link key={a.handle} href="/sellers" className="card overflow-hidden group hover:shadow-md transition-shadow">
                <div className="aspect-square relative bg-gradient-to-br from-accent/30 to-gold-bg/40 overflow-hidden">
                  {a.photo && <Image src={a.photo} alt={a.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/80 shrink-0 bg-accent/50">
                      {a.avatar && <Image src={a.avatar} alt="" width={40} height={40} className="object-cover" />}
                    </div>
                    <div className="text-white">
                      <p className="text-sm font-semibold truncate">{a.name}</p>
                      <p className="text-xs text-white/70 truncate">{a.bio}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="bg-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-headline mb-4">What Our Community Says</h2>
            <p className="text-text-muted">Join thousands of satisfied artists and collectors.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-6">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < t.rating ? "text-gold" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-text-muted leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-accent/20 shrink-0">
                    {t.avatar && <Image src={t.avatar} alt={t.name} width={40} height={40} className="object-cover" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ NEWSLETTER ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card p-8 md:p-12 bg-gradient-to-br from-accent/5 to-gold-bg/30 border-accent/10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-headline mb-3">Stay Inspired</h2>
            <p className="text-text-muted mb-6">Get the latest collections, artist spotlights, and exclusive offers delivered to your inbox.</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" placeholder="Enter your email" className="input flex-1" required />
              <button type="submit" className="btn-primary shrink-0">Subscribe</button>
            </form>
          </div>
        </div>
      </section>

      {/* ═══════════ SELLER CTA ═══════════ */}
      <section className="border-t border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-headline mb-4">Ready to showcase your work?</h2>
          <p className="text-text-muted max-w-xl mx-auto mb-8 leading-relaxed">
            Join our community of artists and photographers. Sell your work on premium products worldwide with zero upfront cost.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/become-a-seller" className="btn-primary text-lg px-8 py-3">Become a Seller</Link>
            <Link href="/pricing" className="btn-gold text-lg px-8 py-3">Gold Membership</Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
