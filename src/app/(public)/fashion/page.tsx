import PublicLayout from "@/components/layout/PublicLayout"
import Link from "next/link"

export default function FashionPage() {
  return (
    <PublicLayout>
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm uppercase tracking-widest text-text-muted mb-2">Featured Designer</p>
            <h1 className="text-4xl md:text-5xl font-headline mb-4">Fashion Collection</h1>
            <p className="text-lg text-text-muted">
              Curated designs from our featured fashion designer. Each piece tells a story.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="card p-8 text-center hover:shadow-md transition-shadow group">
              <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                <p className="text-text-muted">Collection Preview</p>
              </div>
              <h3 className="font-headline text-xl group-hover:text-accent transition-colors">Spring Collection 2026</h3>
              <p className="text-sm text-text-muted mt-1">Coming Soon</p>
            </div>
            <div className="card p-8 text-center hover:shadow-md transition-shadow group">
              <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                <p className="text-text-muted">Collection Preview</p>
              </div>
              <h3 className="font-headline text-xl group-hover:text-accent transition-colors">Urban Essentials</h3>
              <p className="text-sm text-text-muted mt-1">Coming Soon</p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/shop/apparel" className="btn-primary text-lg px-8 py-3">
              Shop Apparel
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
