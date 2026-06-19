import Link from "next/link"
import Image from "next/image"
import PublicLayout from "@/components/layout/PublicLayout"
import { getDemoCollections } from "@/lib/demo-data"

export default function CollectionsPage() {
  const collections = getDemoCollections()

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-accent/5 to-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-headline mb-4">Collections</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Curated selections of stunning photography, thoughtfully grouped by theme and style.
            Discover your next favorite artist.
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((c: any) => (
            <Link key={c.id} href={`/collections/${c.id}`} className="card overflow-hidden group hover:shadow-lg transition-all">
              <div className="aspect-[16/9] relative bg-gray-100 overflow-hidden">
                {c.cover_media?.storage_path_derivative && (
                  <Image src={c.cover_media.storage_path_derivative} alt={c.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
              <div className="p-5">
                <h3 className="font-headline font-semibold text-lg group-hover:text-accent transition-colors">{c.title}</h3>
                {c.description && <p className="text-sm text-text-muted mt-1 line-clamp-2">{c.description}</p>}
                <span className="inline-block mt-3 text-sm text-accent font-medium group-hover:underline">
                  Explore collection &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  )
}
