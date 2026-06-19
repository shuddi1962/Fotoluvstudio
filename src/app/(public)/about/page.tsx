import PublicLayout from "@/components/layout/PublicLayout"
import Link from "next/link"
import { getDemoStats } from "@/lib/demo-data"

const values = [
  { title: "Empower Creators", desc: "We provide the tools, audience, and infrastructure for artists to turn their passion into a sustainable business.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { title: "Quality First", desc: "Every print uses archival-grade materials and the latest printing technology to ensure your artwork looks its best.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { title: "Community Driven", desc: "We believe in the power of visual storytelling and the connections it creates between artists and audiences worldwide.", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { title: "Global Reach", desc: "From our workshop to your doorstep — we ship premium products to customers in over 50 countries worldwide.", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
]

export default function AboutPage() {
  const stats = getDemoStats()

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-accent/5 to-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-headline mb-6">About fotoluvstudio</h1>
          <p className="text-xl text-text-muted leading-relaxed max-w-2xl mx-auto">
            We believe every photograph deserves to be seen, shared, and cherished.
            Our platform connects creators with collectors, turning art into lasting impressions.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-headline mb-6">Our Story</h2>
        <div className="space-y-4 text-text-muted leading-relaxed">
          <p>
            fotoluvstudio started with a simple idea: every photograph deserves to be seen,
            shared, and cherished. What began as a photography portfolio has grown into a
            vibrant community of artists, designers, and collectors.
          </p>
          <p>
            We believe in the power of visual storytelling. Our platform connects photographers
            with clients who want to preserve their special moments, artists with customers who
            want to bring art into their homes, and fashion designers with audiences who
            appreciate creative expression.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-accent text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-headline font-bold">{s.value}</div>
                <div className="text-sm text-white/70 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-headline mb-4">Our Mission</h2>
          <p className="text-text-muted">
            To empower creators at every level — from hobbyist photographers to professional
            artists — by providing the tools, audience, and infrastructure they need to share
            their work and build a business around their passion.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((v) => (
            <div key={v.title} className="card p-6 flex gap-4 items-start hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={v.icon} />
                </svg>
              </div>
              <div>
                <h3 className="font-headline text-lg font-semibold mb-1">{v.title}</h3>
                <p className="text-sm text-text-muted">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Owner */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl md:text-3xl font-headline mb-6 text-center">The Platform Owner</h2>
          <div className="card p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-gold-bg mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-text-muted leading-relaxed max-w-xl mx-auto">
              fotoluvstudio was founded by a photographer who understands the challenges of
              turning a creative craft into a sustainable business. Every feature on this platform
              was built with real creators in mind.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-headline mb-4">Join Our Community</h2>
        <p className="text-text-muted mb-6">Whether you're an artist, collector, or admirer — there's a place for you here.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/register" className="btn-primary text-lg px-8 py-3">Get Started</Link>
          <Link href="/contact" className="btn-secondary text-lg px-8 py-3">Contact Us</Link>
        </div>
      </section>
    </PublicLayout>
  )
}
