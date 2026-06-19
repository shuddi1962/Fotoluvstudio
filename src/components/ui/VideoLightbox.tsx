'use client'

import { useState, useRef, useEffect } from 'react'

interface VideoLightboxProps {
  src: string
  title: string
  children: React.ReactNode
}

export default function VideoLightbox({ src, title, children }: VideoLightboxProps) {
  const [open, setOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!open && videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [open])

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full bg-black rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <video
              ref={videoRef}
              src={src}
              controls
              autoPlay
              className="w-full aspect-[9/16] max-h-[80vh] object-contain bg-black"
              playsInline
            />
            <div className="p-4 bg-black/90">
              <p className="text-white font-medium">{title}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
