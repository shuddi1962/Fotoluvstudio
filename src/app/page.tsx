import Link from "next/link"
import PublicLayout from "@/components/layout/PublicLayout"

export default function HomePage() {
  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-headline text-text mb-6">
            Every image has a story worth telling
          </h1>
          <p className="text-xl text-text-muted mb-8 leading-relaxed">
            Explore a world of photography, shop stunning prints on premium products, 
            discover independent artists, and experience fashion design brought to life.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/gallery" className="btn-primary text-lg px-8 py-3">
              Browse Gallery
            </Link>
            <Link href="/shop" className="btn-secondary text-lg px-8 py-3">
              Shop Prints
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-headline mb-2">Public Gallery</h3>
            <p className="text-text-muted">Browse thousands of stunning photographs. Find inspiration, save your favorites, and discover new artists.</p>
          </div>
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <h3 className="text-xl font-headline mb-2">Print-on-Demand Shop</h3>
            <p className="text-text-muted">Turn your favorite photos into canvas prints, apparel, mugs, and more. Every purchase supports the artist.</p>
          </div>
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-gold-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-xl font-headline mb-2">Gold Membership</h3>
            <p className="text-text-muted">Unlock watermark-free full-resolution downloads from your event galleries. The ultimate photography experience.</p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-headline mb-4">Ready to showcase your work?</h2>
          <p className="text-text-muted mb-6">Join our community of artists and photographers. Sell your work on premium products worldwide.</p>
          <Link href="/become-a-seller" className="btn-primary text-lg px-8 py-3">
            Become a Seller
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
