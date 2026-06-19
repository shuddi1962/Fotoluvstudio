import PublicLayout from "@/components/layout/PublicLayout"

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-headline mb-6">About fotoluvstudio</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-text-muted leading-relaxed mb-6">
            fotoluvstudio started with a simple idea: every photograph deserves to be seen, 
            shared, and cherished. What began as a photography portfolio has grown into a 
            vibrant community of artists, designers, and collectors.
          </p>
          <p className="text-text-muted leading-relaxed mb-6">
            We believe in the power of visual storytelling. Our platform connects photographers 
            with clients who want to preserve their special moments, artists with customers who 
            want to bring art into their homes, and fashion designers with audiences who 
            appreciate creative expression.
          </p>
          <h2 className="text-2xl font-headline mt-10 mb-4">Our Mission</h2>
          <p className="text-text-muted leading-relaxed mb-6">
            To empower creators at every level — from hobbyist photographers to professional 
            artists — by providing the tools, audience, and infrastructure they need to share 
            their work and build a business around their passion.
          </p>
          <h2 className="text-2xl font-headline mt-10 mb-4">The Platform Owner</h2>
          <p className="text-text-muted leading-relaxed">
            fotoluvstudio was founded by a photographer who understands the challenges of 
            turning a creative craft into a sustainable business. Every feature on this platform 
            was built with real creators in mind.
          </p>
        </div>
      </div>
    </PublicLayout>
  )
}
