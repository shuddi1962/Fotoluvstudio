import PublicLayout from "@/components/layout/PublicLayout"
import Link from "next/link"

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const categoryName = category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/shop" className="text-sm text-accent hover:underline mb-4 inline-block">&larr; All Categories</Link>
        <h1 className="text-3xl font-headline mb-8">{categoryName}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="card p-4 text-center">
              <div className="aspect-square bg-gray-100 rounded mb-2" />
              <p className="text-sm font-medium">Product {i}</p>
              <p className="text-sm text-accent font-semibold">$29.99</p>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  )
}
