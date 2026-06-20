import Image from "next/image"
import PublicLayout from "@/components/layout/PublicLayout"
import Link from "next/link"
import FashionGallery from "./FashionGallery"
import { getDemoFashionItems, getDemoMedia } from "@/lib/demo-data"

export default async function FashionPage() {
  const items = await getDemoFashionItems()
  const collections = await getDemoMedia(2)

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent/5 via-primary-bg to-gold-bg/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-sm font-medium rounded-full mb-4">Featured Designer</span>
            <h1 className="text-4xl md:text-6xl font-headline mb-4">Fashion Collection</h1>
            <p className="text-lg text-text-muted">
              Curated designs from our featured fashion designer. Each piece tells a story
              of creativity, craftsmanship, and personal style.
            </p>
          </div>
        </div>
      </section>

      {/* Fashion Lookbook Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-headline">Lookbook</h2>
          <Link href="/shop/apparel" className="text-sm text-accent hover:underline font-medium">Shop apparel &rarr;</Link>
        </div>
        <FashionGallery items={items} />
      </section>

      {/* Collections */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-headline mb-4">Featured Collections</h2>
            <p className="text-text-muted">Explore our latest curated fashion collections.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Spring Collection 2026", desc: "Light fabrics, pastel tones, and effortless elegance for the new season.", items: 24, img: collections[0] },
              { title: "Urban Essentials", desc: "Modern silhouettes for the city dweller. Clean lines meet street-ready style.", items: 18, img: collections[1] },
            ].map((col) => (
              <Link key={col.title} href={`/fashion/collection/${col.title.toLowerCase().replace(/\s+/g, '-')}`} className="card overflow-hidden hover:shadow-md transition-shadow group">
                <div className="aspect-[3/4] relative bg-gradient-to-br from-accent/10 to-gold-bg/40 overflow-hidden">
                  {col.img && (
                    <Image src={col.img.storage_path_derivative} alt={col.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-headline text-2xl text-white mb-1">{col.title}</h3>
                    <p className="text-white/80 text-sm">{col.items} pieces</p>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <p className="text-sm text-text-muted mb-3">{col.desc}</p>
                  <span className="text-sm text-accent font-medium group-hover:underline">View collection &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-text-muted mb-4">Want to see these designs on premium apparel?</p>
        <Link href="/shop/apparel" className="btn-primary text-lg px-8 py-3">
          Shop Apparel
        </Link>
      </section>
    </PublicLayout>
  )
}
