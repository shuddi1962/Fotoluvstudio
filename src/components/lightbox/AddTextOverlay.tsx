'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase-client'

interface AddTextOverlayProps {
  mediaId: string
  mediaUrl: string
  sourceWasWatermarked: boolean
  onClose: () => void
}

const FONTS = ['Inter', 'Fraunces', 'Arial', 'Georgia', 'Courier New', 'Impact']
const COLORS = ['#FFFFFF', '#000000', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA']
const SIZES = [16, 20, 24, 32, 40, 48, 64]

export default function AddTextOverlay({ mediaId, mediaUrl, sourceWasWatermarked, onClose }: AddTextOverlayProps) {
  const [text, setText] = useState('')
  const [font, setFont] = useState('Inter')
  const [color, setColor] = useState('#FFFFFF')
  const [size, setSize] = useState(32)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [isDragging, setIsDragging] = useState(false)
  const [saving, setSaving] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    const rect = overlayRef.current?.parentElement?.getBoundingClientRect()
    if (rect) {
      setPosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const rect = overlayRef.current?.parentElement?.getBoundingClientRect()
    if (rect) {
      setPosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      })
    }
  }

  const handleSave = async () => {
    if (!text.trim()) return
    setSaving(true)

    await supabase.from('media_edits').insert({
      media_id: mediaId,
      tool_used: 'add_text',
      source_was_watermarked: sourceWasWatermarked,
    })

    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-white/70 hover:text-white text-sm">Cancel</button>
          <span className="text-white/30">|</span>
          <span className="text-white text-sm font-medium">Add Text</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={!text.trim() || saving}
            className="px-4 py-1.5 bg-accent text-white text-sm rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Apply'}
          </button>
        </div>
      </div>

      {/* Editor controls */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-white/10 bg-white/5">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your text here..."
          className="flex-1 bg-white/10 text-white px-3 py-1.5 rounded text-sm border border-white/20 focus:outline-none focus:border-accent"
          autoFocus
        />
        <select
          value={font}
          onChange={(e) => setFont(e.target.value)}
          className="bg-white/10 text-white px-2 py-1.5 rounded text-sm border border-white/20"
        >
          {FONTS.map((f) => (
            <option key={f} value={f} className="bg-gray-900">{f}</option>
          ))}
        </select>
        <div className="flex gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <select
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="bg-white/10 text-white px-2 py-1.5 rounded text-sm border border-white/20"
        >
          {SIZES.map((s) => (
            <option key={s} value={s} className="bg-gray-900">{s}px</option>
          ))}
        </select>
      </div>

      {/* Preview area */}
      <div
        className="flex-1 relative overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <img src={mediaUrl} alt="" className="w-full h-full object-contain" draggable={false} />
        <div
          ref={overlayRef}
          onMouseDown={handleMouseDown}
          className="absolute cursor-move select-none"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <p
            style={{
              fontFamily: font,
              color: color,
              fontSize: `${size}px`,
              textShadow: '0 2px 8px rgba(0,0,0,0.7), 0 0 2px rgba(0,0,0,0.5)',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}
          >
            {text || 'Preview Text'}
          </p>
        </div>
      </div>
    </div>
  )
}
