import Image from "next/image"
import PublicLayout from "@/components/layout/PublicLayout"
import Link from "next/link"
import { getDemoFashionItems } from "@/lib/demo-data"

export default async function FashionPage() {
  const items = await getDemoFashionItems()

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item: any) => (
            <div key={item.id} className="group relative overflow-hidden rounded-lg bg-gray-100">
              <div className="aspect-[3/4] relative">
                <Image
                  src={item.storage_path_derivative}
                  alt={item.title || "Fashion"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width:768px) 50vw, 25vw"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                <p className="text-white text-sm font-medium">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
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
              { title: "Spring Collection 2026", desc: "Light fabrics, pastel tones, and effortless elegance for the new season.", items: 24 },
              { title: "Urban Essentials", desc: "Modern silhouettes for the city dweller. Clean lines meet street-ready style.", items: 18 },
            ].map((col) => (
              <div key={col.title} className="card p-8 text-center hover:shadow-md transition-shadow group">
                <div className="aspect-[3/4] bg-gradient-to-br from-accent/10 to-gold-bg/40 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  <div className="text-center p-6">
                    <svg className="w-12 h-12 text-accent/40 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <p className="text-text-muted text-sm">{col.items} pieces</p>
                  </div>
                </div>
                <h3 className="font-headline text-xl group-hover:text-accent transition-colors">{col.title}</h3>
                <p className="text-sm text-text-muted mt-2">{col.desc}</p>
                <span className="inline-block mt-4 text-sm text-accent font-medium group-hover:underline">View collection &rarr;</span>
              </div>
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
