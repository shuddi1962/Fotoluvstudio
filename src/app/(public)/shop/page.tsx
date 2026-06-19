import Link from "next/link"
import Image from "next/image"
import PublicLayout from "@/components/layout/PublicLayout"
import { SHOP_CATEGORIES, SUB_CATEGORIES } from "@/lib/constants"
import { getDemoProducts } from "@/lib/demo-data"

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

export default async function ShopPage() {
  const products = await getDemoProducts()

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-accent/5 to-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-headline mb-4">Shop</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Discover unique products featuring artwork from our community of artists.
            Every purchase supports independent creators worldwide.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHOP_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop/${cat.slug}`}
              className={`card overflow-hidden group hover:shadow-lg transition-all bg-gradient-to-br ${categoryGradients[cat.slug]}`}
            >
              <div className="p-8">
                <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={categoryIcons[cat.slug]} />
                  </svg>
                </div>
                <h3 className="text-xl font-headline font-semibold mb-2 group-hover:text-accent transition-colors">{cat.name}</h3>
                <ul className="space-y-1 mb-4">
                  {SUB_CATEGORIES[cat.slug as keyof typeof SUB_CATEGORIES].slice(0, 3).map((sub) => (
                    <li key={sub} className="text-sm text-text-muted">{sub}</li>
                  ))}
                </ul>
                <span className="text-sm text-accent font-medium group-hover:underline">
                  Browse all &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-headline">Popular Products</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p: any) => (
              <Link key={p.id} href={`/shop/product/${p.id}`} className="card overflow-hidden group hover:shadow-md transition-shadow">
                <div className="aspect-square relative bg-gradient-to-br from-accent/10 to-gold-bg/20 overflow-hidden">
                  <Image src={p.mockup_url} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />
                </div>
                <div className="p-3">
                  <p className="text-xs text-text-muted truncate">{p.pod_product?.name || "Product"}</p>
                  <p className="font-semibold text-accent">${p.seller_price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Shop with Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-headline mb-4">Why Shop with Us</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", title: "Premium Quality", desc: "Archival-grade inks and materials. Your artwork deserves the best." },
            { icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", title: "Worldwide Shipping", desc: "Delivered to your doorstep anywhere in the world." },
            { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", title: "Easy Returns", desc: "Not satisfied? We'll make it right with our hassle-free returns." },
            { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", title: "Support Artists", desc: "Every purchase directly supports independent artists and photographers." },
          ].map((item) => (
            <div key={item.title} className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  )
}
