import PublicLayout from "@/components/layout/PublicLayout"
import Link from "next/link"

export default function PricingPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-headline mb-4">Gold Membership</h1>
          <p className="text-xl text-text-muted">Unlock the full fotoluvstudio experience</p>
        </div>

        <div className="card p-8 md:p-12 max-w-lg mx-auto border-gold/30 bg-gold-bg/10">
          <div className="text-center mb-8">
            <div className="text-gold font-headline text-5xl mb-2">$9.99</div>
            <p className="text-text-muted">per month</p>
          </div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gold mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Watermark-free, full-resolution downloads from your event galleries</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gold mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Unlimited access to all your event photos at original quality</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gold mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Priority support for print orders</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gold mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Exclusive access to premium collections</span>
            </li>
          </ul>
          <Link href="/register" className="btn-gold w-full text-center block text-lg py-3">
            Become a Gold Member
          </Link>
        </div>
      </div>
    </PublicLayout>
  )
}
