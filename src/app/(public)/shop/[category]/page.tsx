import Image from "next/image"
import Link from "next/link"
import PublicLayout from "@/components/layout/PublicLayout"
import { SHOP_CATEGORIES, SUB_CATEGORIES } from "@/lib/constants"
import { getDemoProducts } from "@/lib/demo-data"

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const catInfo = SHOP_CATEGORIES.find((c) => c.slug === category)
  const categoryName = catInfo?.name || category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  const subCategories = SUB_CATEGORIES[category as keyof typeof SUB_CATEGORIES] || []
  const products = await getDemoProducts()

  return (
    <PublicLayout>
      {/* Breadcrumb & Header */}
      <div className="bg-gradient-to-b from-accent/5 to-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/shop" className="text-sm text-accent hover:underline mb-4 inline-block">&larr; All Categories</Link>
          <h1 className="text-3xl md:text-4xl font-headline mb-2">{categoryName}</h1>
          <p className="text-text-muted">
            Browse our collection of {categoryName.toLowerCase()} — each piece available on a variety of premium products.
          </p>
        </div>
      </div>

      {/* Sub-categories */}
      {subCategories.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-2">
            {subCategories.map((sub) => (
              <span key={sub} className="px-4 py-1.5 text-sm rounded-full border border-border text-text-muted hover:border-accent hover:text-accent transition-colors cursor-pointer">
                {sub}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p: any) => (
            <Link key={p.id} href={`/shop/product/${p.id}`} className="card overflow-hidden group hover:shadow-md transition-shadow">
              <div className="aspect-square relative bg-gradient-to-br from-accent/10 to-gold-bg/20 overflow-hidden">
                <Image src={p.mockup_url} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />
              </div>
              <div className="p-3">
                <p className="text-xs text-text-muted truncate">{p.pod_product?.name || "Product"}</p>
                <p className="font-semibold text-accent">${Number(p.seller_price).toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  )
}
