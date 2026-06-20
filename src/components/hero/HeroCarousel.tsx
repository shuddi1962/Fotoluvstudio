'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { getCuratedPhotos, getProductPhotos, imgUrl } from '@/lib/pexels'
import type { PexPhoto } from '@/lib/pexels'

const SLIDE_MS = 6000
const FADE_DURATION = 0.6

const FALLBACK_GRADIENTS = [
  'from-accent/10 via-primary-bg to-gold-bg/20',
  'from-accent/5 via-primary-bg to-accent/10',
  'from-gold-bg/30 via-primary-bg to-accent/10',
]

interface Cta { label: string; href: string; variant: 'primary' | 'secondary' | 'gold' }

const SLIDES: { id: string; headline: React.ReactNode; subtext: string; ctas: Cta[] }[] = [
  {
    id: 'story',
    headline: <>Every image has a <span className="text-accent">story</span> worth telling</>,
    subtext: 'Explore a world of photography, shop stunning prints on premium products, discover independent artists, and experience fashion design brought to life.',
    ctas: [
      { label: 'Browse Gallery', href: '/gallery', variant: 'primary' },
      { label: 'Shop Prints', href: '/shop', variant: 'secondary' },
      { label: 'Watch Videos', href: '/videos', variant: 'gold' },
    ],
  },
  {
    id: 'marketplace',
    headline: <>Wear the moment, <span className="text-accent">hang the memory</span></>,
    subtext: 'From canvas to couture — transform your favorite photography into premium products that bring art into everyday life.',
    ctas: [
      { label: 'Shop Now', href: '/shop', variant: 'primary' },
      { label: 'Become a Seller', href: '/become-a-seller', variant: 'gold' },
    ],
  },
  {
    id: 'community',
    headline: <>Turn your passion into <span className="text-accent">profit</span></>,
    subtext: 'Join a thriving community of artists. Sell your work on premium products worldwide with zero upfront cost and keep more of what you earn.',
    ctas: [
      { label: 'Start Selling', href: '/become-a-seller', variant: 'primary' },
      { label: 'Gold Membership', href: '/pricing', variant: 'gold' },
      { label: 'Learn More', href: '/about', variant: 'secondary' },
    ],
  },
]

function btnClass(variant: Cta['variant']) {
  if (variant === 'primary') return 'btn-primary text-base md:text-lg px-6 md:px-8 py-2.5 md:py-3 shadow-sm hover:shadow-md'
  if (variant === 'gold') return 'btn-gold text-base md:text-lg px-6 md:px-8 py-2.5 md:py-3'
  return 'btn-secondary text-base md:text-lg px-6 md:px-8 py-2.5 md:py-3'
}

export default function HeroCarousel() {
  const reduced = useReducedMotion()
  const [photos, setPhotos] = useState<PexPhoto[]>([])
  const [ready, setReady] = useState(false)
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    ;(async () => {
      const c = await getCuratedPhotos(6)
      if (c.length >= 3) setPhotos(c)
      else setPhotos(await getProductPhotos(6))
      setReady(true)
    })()
  }, [])

  const schedule = useCallback(() => {
    if (timer.current) clearInterval(timer.current)
    if (reduced) return
    timer.current = setInterval(() => {
      setCurrent((p) => (p + 1) % 3)
    }, SLIDE_MS)
  }, [reduced])

  useEffect(() => {
    if (ready && !paused) schedule()
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [ready, paused, schedule])

  const go = (i: number) => { setCurrent(i); schedule() }
  const next = () => go((current + 1) % 3)
  const prev = () => go((current - 1 + 3) % 3)

  const img = (i: number) => (photos[i % photos.length] ? imgUrl(photos[i % photos.length], 'large2x') : '')

  return (
    <section
      className="relative overflow-hidden min-h-[55vh] md:min-h-[60vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide layer */}
      <AnimatePresence>
        {current === 0 && (
          <SlideKenBurns
            key="s0"
            imageA={img(0)}
            imageB={img(1)}
            gradient={FALLBACK_GRADIENTS[0]}
            slide={SLIDES[0]}
          />
        )}
        {current === 1 && (
          <SlideFull
            key="s1"
            image={img(1)}
            gradient={FALLBACK_GRADIENTS[1]}
            slide={SLIDES[1]}
            reduced={reduced}
          />
        )}
        {current === 2 && (
          <SlideSplit
            key="s2"
            images={[img(2), img(3), img(4), img(5)].filter(Boolean)}
            gradient={FALLBACK_GRADIENTS[2]}
            slide={SLIDES[2]}
            reduced={reduced}
          />
        )}
      </AnimatePresence>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40 pointer-events-none z-[1]" />

      {/* Bottom fade hinting at content below */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-primary-bg via-primary-bg/80 to-transparent pointer-events-none z-[3]" />

      {/* Navigation arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/25 flex items-center justify-center text-white transition-all hover:scale-110"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/25 flex items-center justify-center text-white transition-all hover:scale-110"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-500 ${
              i === current ? 'bg-white w-8 h-2.5' : 'bg-white/30 hover:bg-white/50 w-2.5 h-2.5'
            }`}
          />
        ))}
      </div>

      {/* Scroll-down indicator — prominent, animated */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <motion.span
          className="text-xs text-white/40 font-medium tracking-widest uppercase"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        >
          Scroll to explore
        </motion.span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-0.5"
        >
          <motion.svg
            className="w-4 h-4 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7" />
          </motion.svg>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ─── Slide 0 — Ken Burns / crossfade background ─── */
function SlideKenBurns({ imageA, imageB, gradient, slide }: { imageA: string; imageB: string; gradient: string; slide: typeof SLIDES[0] }) {
  const hasA = !!imageA
  const [showB, setShowB] = useState(false)

  useEffect(() => {
    if (!hasA) return
    const t = setTimeout(() => setShowB(true), SLIDE_MS / 2)
    return () => clearTimeout(t)
  }, [hasA])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: FADE_DURATION, ease: 'easeInOut' }}
      className="absolute inset-0"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

      {hasA && (
        <motion.img
          src={imageA}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1 }}
          animate={{ scale: 1.08 }}
          transition={{ duration: SLIDE_MS / 1000, ease: 'easeOut' }}
        />
      )}

      {showB && !!imageB && (
        <motion.img
          src={imageB}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.5, scale: 1.08 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
      )}

      <ContentLayer slide={slide} layout="center" />
    </motion.div>
  )
}

/* ─── Slide 1 — Full slide change with entrance animation ─── */
function SlideFull({ image, gradient, slide, reduced }: { image: string; gradient: string; slide: typeof SLIDES[0]; reduced: boolean | null }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: FADE_DURATION, ease: 'easeInOut' }}
      className="absolute inset-0"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      {image && (
        <motion.img
          src={image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={reduced ? {} : { scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      )}
      <ContentLayer slide={slide} layout="slideUp" reduced={reduced} />
    </motion.div>
  )
}

/* ─── Slide 2 — Split layout with staggered photo grid ─── */
function SlideSplit({ images, gradient, slide, reduced }: { images: string[]; gradient: string; slide: typeof SLIDES[0]; reduced: boolean | null }) {
  const grid = images.length >= 3 ? images : []

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: FADE_DURATION, ease: 'easeInOut' }}
      className="absolute inset-0"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="absolute inset-0 flex flex-col md:flex-row">
        <div className="flex-1 flex items-center justify-center px-6 md:px-12 lg:px-16 z-10">
          <div className="max-w-xl text-center md:text-left py-8">
            <motion.span
              className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-full mb-6"
              initial={reduced ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Discover &bull; Create &bull; Collect
            </motion.span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-headline text-white leading-tight mb-4">
              {slide.headline}
            </h1>
            <p className="text-sm md:text-lg text-white/70 mb-6 max-w-lg leading-relaxed">
              {slide.subtext}
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {slide.ctas.map((c) => (
                <Link key={c.label} href={c.href} className={btnClass(c.variant)}>
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {grid.length >= 3 && (
          <motion.div
            className="hidden md:flex-1 md:flex items-center justify-center p-8 lg:p-12 z-10"
            initial="hidden"
            animate="show"
            variants={reduced ? {} : {
              hidden: {},
              show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
            }}
          >
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {grid.slice(0, 4).map((src, i) => (
                <motion.div
                  key={i}
                  variants={reduced ? {} : {
                    hidden: { opacity: 0, y: 24 },
                    show: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`overflow-hidden rounded-xl shadow-lg ${
                    i === 0 || i === 3 ? 'row-span-2' : ''
                  }`}
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover"
                    style={{ aspectRatio: i === 0 || i === 3 ? '3/4' : '1' }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

/* ─── Shared content layer ─── */
function ContentLayer({
  slide,
  layout,
  reduced,
}: {
  slide: (typeof SLIDES)[0]
  layout: 'center' | 'slideUp'
  reduced?: boolean | null
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto">
        {layout === 'slideUp' ? (
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <PillAndContent slide={slide} />
          </motion.div>
        ) : (
          <PillAndContent slide={slide} />
        )}
      </div>
    </div>
  )
}

function PillAndContent({ slide }: { slide: (typeof SLIDES)[0] }) {
  return (
    <>
      <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-full mb-5">
        Discover &bull; Create &bull; Collect
      </span>
      <h1 className="text-3xl md:text-5xl lg:text-7xl font-headline text-white leading-tight mb-4">
        {slide.headline}
      </h1>
      <p className="text-sm md:text-lg text-white/70 mb-6 max-w-2xl mx-auto leading-relaxed">
        {slide.subtext}
      </p>
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {slide.ctas.map((c) => (
          <Link key={c.label} href={c.href} className={btnClass(c.variant)}>
            {c.label}
          </Link>
        ))}
      </div>
    </>
  )
}
