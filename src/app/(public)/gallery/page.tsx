import PublicLayout from "@/components/layout/PublicLayout"
import GalleryClient from "./GalleryClient"

export default function GalleryPage() {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-headline mb-2">Gallery</h1>
        <p className="text-text-muted mb-8">Browse our curated collection of stunning photography.</p>
        <GalleryClient />
      </div>
    </PublicLayout>
  )
}
