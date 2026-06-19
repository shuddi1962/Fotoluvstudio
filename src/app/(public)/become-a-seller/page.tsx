import PublicLayout from "@/components/layout/PublicLayout"
import Link from "next/link"

export default function BecomeSellerPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-headline mb-4 text-center">Become a Seller</h1>
        <p className="text-xl text-text-muted text-center mb-12">
          Turn your art and photography into products people love.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card p-6 text-center">
            <div className="text-3xl font-headline text-accent mb-2">1</div>
            <h3 className="font-semibold mb-2">Upload Your Art</h3>
            <p className="text-sm text-text-muted">Upload your photography or designs to your seller dashboard.</p>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-headline text-accent mb-2">2</div>
            <h3 className="font-semibold mb-2">Pick Products</h3>
            <p className="text-sm text-text-muted">Choose from canvas, apparel, mugs, and more premium products.</p>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-headline text-accent mb-2">3</div>
            <h3 className="font-semibold mb-2">Start Selling</h3>
            <p className="text-sm text-text-muted">We handle printing, fulfillment, and shipping worldwide.</p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/register" className="btn-primary text-lg px-8 py-3">
            Get Started
          </Link>
        </div>
      </div>
    </PublicLayout>
  )
}
