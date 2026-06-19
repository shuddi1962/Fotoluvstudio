import PublicLayout from "@/components/layout/PublicLayout"

export default function PoliciesPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-headline mb-8">Policies</h1>
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-headline mb-3">Return & Refund Policy</h2>
            <p className="text-text-muted leading-relaxed">
              Since all products are print-on-demand and custom-made specifically for your order, 
              we cannot accept returns or exchanges unless the item arrives damaged or defective. 
              If your order arrives damaged, please contact us within 14 days of delivery with 
              photos of the damage, and we will arrange a replacement.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-headline mb-3">Shipping Policy</h2>
            <p className="text-text-muted leading-relaxed">
              All products are printed and shipped by our fulfillment partners. Standard shipping 
              typically takes 5-10 business days for production plus shipping time. Tracking 
              information will be provided once your order ships.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-headline mb-3">Privacy Policy</h2>
            <p className="text-text-muted leading-relaxed">
              We respect your privacy. Your personal information is used only for order processing 
              and account management. We never share your data with third parties except as 
              necessary for payment processing and order fulfillment.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-headline mb-3">Terms of Service</h2>
            <p className="text-text-muted leading-relaxed">
              By using fotoluvstudio, you agree to our terms. Sellers are responsible for ensuring 
              they own the rights to all uploaded content. The platform reserves the right to 
              remove content that violates our policies.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  )
}
