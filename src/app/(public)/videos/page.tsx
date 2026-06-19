import Image from "next/image"
import Link from "next/link"
import PublicLayout from "@/components/layout/PublicLayout"
import { getDemoVideos } from "@/lib/demo-data"

export default async function VideosPage() {
  const videos = await getDemoVideos()

  return (
    <PublicLayout>
      <section className="bg-gradient-to-b from-accent/5 to-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-headline mb-4">Videos</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Immersive video content from our community of creators.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v: any) => (
            <div key={v.id} className="card overflow-hidden group hover:shadow-md transition-shadow">
              <div className="aspect-[9/16] relative bg-gradient-to-br from-accent/20 to-gold-bg/30 overflow-hidden">
                <Image src={v.thumbnail || v.storage_path_derivative} alt={v.title || ""} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:768px) 100vw, 33vw" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-accent ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-headline font-semibold group-hover:text-accent transition-colors">{v.title}</h3>
                {v.duration && <p className="text-xs text-text-muted mt-1">{Math.floor(v.duration / 60)}:{String(v.duration % 60).padStart(2, '0')} min</p>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  )
}
