'use client'

import { Suspense } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import CommissionForm from '@/components/commission/CommissionForm'
import Spinner from '@/components/ui/Spinner'

export default function NewCommissionPage() {
  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Page Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-sm font-medium rounded-full mb-4">
            Bespoke Tailoring
          </span>
          <h1 className="text-4xl md:text-5xl font-headline text-text mb-4">
            Commission a Custom Piece
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Made-to-measure, crafted just for you. Work directly with the designer
            to create something独一无二.
          </p>
        </div>

        <Suspense fallback={<div className="flex justify-center py-16"><Spinner /></div>}>
          <CommissionForm />
        </Suspense>
      </section>
    </PublicLayout>
  )
}
