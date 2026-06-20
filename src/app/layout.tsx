import type { Metadata } from "next"
import { Fraunces, Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/context/CartContext"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
})

export const metadata: Metadata = {
  title: "Fotoluvstudio",
  description: "Photography, print-on-demand marketplace, and fashion showcase",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
