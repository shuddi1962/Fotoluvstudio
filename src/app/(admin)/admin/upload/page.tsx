'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function AdminUploadPage() {
  const supabase = createClient()
  const [form, setForm] = useState({
    title: '', description: '', date: '', location: '', category: '',
    image_url: '', price: '', max_attendees: ''
  })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('events').insert({
      title: form.title,
      description: form.description,
      date: form.date,
      location: form.location,
      category: form.category,
      image_url: form.image_url || null,
      price: form.price ? parseFloat(form.price) : null,
      max_attendees: form.max_attendees ? parseInt(form.max_attendees) : null,
      created_by: user.id,
      status: 'upcoming'
    })
    setSaving(false)
    if (!error) {
      setDone(true)
      setForm({ title: '', description: '', date: '', location: '', category: '', image_url: '', price: '', max_attendees: '' })
    }
  }

  if (done) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-accent mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold mb-2">Event Created!</h2>
            <p className="text-text-muted mb-6">Your event has been published successfully.</p>
            <Button onClick={() => setDone(false)}>Create Another</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload New Event</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Event Title *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows={4} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required className="w-full px-3 py-2 border rounded-lg">
                <option value="">Select...</option>
                <option value="Fashion">Fashion</option>
                <option value="Art">Art</option>
                <option value="Music">Music</option>
                <option value="Film">Film</option>
                <option value="Photography">Photography</option>
                <option value="Design">Design</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location *</label>
            <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (optional)</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Attendees (optional)</label>
              <input type="number" value={form.max_attendees} onChange={e => setForm({...form, max_attendees: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="https://..." />
          </div>
          <Button type="submit" loading={saving}>Create Event</Button>
        </form>
      </Card>
    </div>
  )
}
