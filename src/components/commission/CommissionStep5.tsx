'use client'

import Button from '@/components/ui/Button'
import Link from 'next/link'

interface CommissionStep5Props {
  commissionId: string
  depositAmount: number
}

export default function CommissionStep5({ commissionId, depositAmount }: CommissionStep5Props) {
  return (
    <div className="max-w-lg mx-auto text-center space-y-8">
      <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <h2 className="text-3xl font-headline text-text mb-3">Request Submitted!</h2>
        <p className="text-text-muted max-w-md mx-auto">
          Your bespoke commission request has been sent to the designer. They will review it and get back to you with a confirmed quote and timeline.
        </p>
      </div>

      {depositAmount > 0 && (
        <div className="card p-6 border border-accent/20 bg-accent/5">
          <p className="text-sm text-text-muted mb-2">Deposit Required to Proceed</p>
          <p className="text-3xl font-headline font-bold text-accent">₦{depositAmount.toLocaleString()}</p>
          <p className="text-xs text-text-muted mt-2">
            You'll be able to pay the deposit once the designer confirms your quote.
          </p>
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl p-6 text-left space-y-3">
        <h3 className="font-headline font-semibold text-text">What happens next?</h3>
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-accent/10 text-accent text-sm font-medium flex items-center justify-center shrink-0 mt-0.5">1</div>
          <p className="text-sm text-text-muted">The designer reviews your request (usually within 1-2 business days)</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-accent/10 text-accent text-sm font-medium flex items-center justify-center shrink-0 mt-0.5">2</div>
          <p className="text-sm text-text-muted">You'll receive a confirmed quote, timeline, and the option to pay a deposit</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-accent/10 text-accent text-sm font-medium flex items-center justify-center shrink-0 mt-0.5">3</div>
          <p className="text-sm text-text-muted">Production begins once the deposit is confirmed</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={`/dashboard/commissions/${commissionId}`}>
          <Button variant="primary">Track Your Commission</Button>
        </Link>
        <Link href="/fashion">
          <Button variant="ghost">Back to Fashion</Button>
        </Link>
      </div>
    </div>
  )
}
