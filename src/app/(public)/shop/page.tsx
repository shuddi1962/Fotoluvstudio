import Link from "next/link"
import PublicLayout from "@/components/layout/PublicLayout"
import { SHOP_CATEGORIES } from "@/lib/constants"

export default function ShopPage() {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-headline mb-2">Shop</h1>
        <p className="text-text-muted mb-8">Discover unique products featuring artwork from our community of artists.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHOP_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop/${cat.slug}`}
              className="card p-8 text-center hover:shadow-md transition-shadow group"
            >
              <h3 className="text-xl font-headline group-hover:text-accent transition-colors">{cat.name}</h3>
              <p className="text-sm text-text-muted mt-2">Browse all {cat.name.toLowerCase()}</p>
            </Link>
          ))}
        </div>
      </div>
    </PublicLayout>
  )
}
