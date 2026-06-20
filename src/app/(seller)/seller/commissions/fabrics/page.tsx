'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import type { FabricOption } from '@/types/database'

export default function FabricsPage() {
  const [fabrics, setFabrics] = useState<FabricOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [priceModifier, setPriceModifier] = useState('')
  const [swatchUrl, setSwatchUrl] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadFabrics()
  }, [])

  const loadFabrics = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('fabric_options')
      .select('*')
      .eq('designer_id', user.id)
      .order('name')

    if (data) setFabrics(data)
    setLoading(false)
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setPriceModifier('')
    setSwatchUrl('')
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (fabric: FabricOption) => {
    setName(fabric.name)
    setDescription(fabric.description || '')
    setPriceModifier(String(fabric.price_modifier))
    setSwatchUrl(fabric.swatch_image_url || '')
    setEditingId(fabric.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    const body = {
      id: editingId,
      name,
      description: description || null,
      price_modifier: parseFloat(priceModifier) || 0,
      swatch_image_url: swatchUrl || null,
    }

    if (editingId) {
      await fetch('/api/fabrics', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } else {
      await fetch('/api/fabrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }
    resetForm()
    loadFabrics()
  }

  const handleToggleActive = async (fabric: FabricOption) => {
    await fetch('/api/fabrics', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: fabric.id }),
    })
    loadFabrics()
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-headline">Fabric Catalog</h1>
          <p className="text-text-muted">Manage the fabric options customers can choose from.</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true) }}>Add Fabric</Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="mb-8 border border-accent/20 bg-accent/5">
          <h3 className="font-headline font-semibold mb-4">{editingId ? 'Edit Fabric' : 'Add New Fabric'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="e.g. Premium Aso-Oke" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Price Modifier (₦)</label>
              <input type="number" value={priceModifier} onChange={(e) => setPriceModifier(e.target.value)} className="input" placeholder="e.g. 15000" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input min-h-[60px]" placeholder="Describe the fabric..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-1">Swatch Image URL</label>
              <input type="text" value={swatchUrl} onChange={(e) => setSwatchUrl(e.target.value)} className="input" placeholder="https://..." />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave}>{editingId ? 'Update' : 'Add'} Fabric</Button>
            <Button variant="ghost" onClick={resetForm}>Cancel</Button>
          </div>
        </Card>
      )}

      {fabrics.length === 0 && !showForm ? (
        <EmptyState
          title="No fabrics yet"
          description="Add fabric options that customers can choose for their commissions."
          action={<Button onClick={() => setShowForm(true)}>Add Your First Fabric</Button>}
        />
      ) : (
        <div className="space-y-3">
          {fabrics.map((fabric) => (
            <Card key={fabric.id} className={`border ${fabric.is_active ? 'border-border' : 'border-border/50 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {fabric.swatch_image_url ? (
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                      <img src={fabric.swatch_image_url} alt={fabric.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-accent/20 to-gold-bg/30 shrink-0 flex items-center justify-center">
                      <span className="text-accent/40 text-lg font-headline">F</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-headline font-semibold text-text">{fabric.name}</h3>
                    {fabric.description && <p className="text-sm text-text-muted">{fabric.description}</p>}
                    <p className={`text-sm font-medium ${fabric.price_modifier > 0 ? 'text-gold' : 'text-text-muted'}`}>
                      {fabric.price_modifier > 0 ? `+₦${fabric.price_modifier.toLocaleString()}` : 'No additional cost'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${fabric.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {fabric.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(fabric)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleToggleActive(fabric)}>
                    {fabric.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
