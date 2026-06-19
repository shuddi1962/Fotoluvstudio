'use client'

import { useState } from 'react'
import PublicLayout from "@/components/layout/PublicLayout"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-headline mb-6">Contact Us</h1>
        {submitted ? (
          <div className="card p-8 text-center">
            <svg className="w-16 h-16 text-success mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-headline mb-2">Message Sent!</h2>
            <p className="text-text-muted">We&apos;ll get back to you as soon as possible.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-8 space-y-4">
            <Input label="Name" placeholder="Your name" required />
            <Input label="Email" type="email" placeholder="you@example.com" required />
            <Input label="Subject" placeholder="How can we help?" required />
            <div className="space-y-1">
              <label className="block text-sm font-medium">Message</label>
              <textarea className="input min-h-[120px]" placeholder="Your message..." required />
            </div>
            <Button type="submit" className="w-full">Send Message</Button>
          </form>
        )}
      </div>
    </PublicLayout>
  )
}
