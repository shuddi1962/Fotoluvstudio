import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-headline text-accent mb-4">fotoluvstudio</h3>
            <p className="text-text-muted text-sm">
              Photography, print-on-demand marketplace, and fashion showcase.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link href="/gallery" className="hover:text-accent">Gallery</Link></li>
              <li><Link href="/shop" className="hover:text-accent">Shop</Link></li>
              <li><Link href="/fashion" className="hover:text-accent">Fashion</Link></li>
              <li><Link href="/collections" className="hover:text-accent">Collections</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Sell</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link href="/become-a-seller" className="hover:text-accent">Become a Seller</Link></li>
              <li><Link href="/pricing" className="hover:text-accent">Gold Membership</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link href="/about" className="hover:text-accent">About</Link></li>
              <li><Link href="/contact" className="hover:text-accent">Contact</Link></li>
              <li><Link href="/policies" className="hover:text-accent">Policies</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-text-muted">
          &copy; {new Date().getFullYear()} fotoluvstudio. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
