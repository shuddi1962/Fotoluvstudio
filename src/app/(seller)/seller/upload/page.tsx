'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function SellerUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('design-uploads')
      .upload(filePath, file)

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    await supabase.from('media').insert({
      owner_id: user.id,
      context: 'seller_design',
      storage_path_original: filePath,
      media_type: 'photo',
      title: title || file.name,
    })

    setUploading(false)
    alert('Design uploaded! You can now apply it to products.')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-headline mb-8">Upload New Design</h1>
      <Card className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Design File</label>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {file ? (
                <p className="text-accent">{file.name}</p>
              ) : (
                <div>
                  <svg className="w-12 h-12 text-text-muted mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-text-muted">Click to upload your design</p>
                  <p className="text-xs text-text-muted mt-1">PNG, JPG up to 10MB</p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Amazing Design"
            className="input"
          />
        </div>

        <Button onClick={handleUpload} loading={uploading} className="w-full">
          Upload Design
        </Button>
      </Card>
    </div>
  )
}
