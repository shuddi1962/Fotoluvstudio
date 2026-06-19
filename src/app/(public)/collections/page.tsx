import Link from "next/link"
import PublicLayout from "@/components/layout/PublicLayout"

export default function CollectionsPage() {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-headline mb-8">Collections</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Link key={i} href={`/collections/${i}`} className="card overflow-hidden group">
              <div className="aspect-[16/9] bg-gray-100" />
              <div className="p-4">
                <h3 className="font-headline font-semibold group-hover:text-accent transition-colors">Collection {i}</h3>
                <p className="text-sm text-text-muted">A curated selection of featured photography.</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PublicLayout>
  )
}
