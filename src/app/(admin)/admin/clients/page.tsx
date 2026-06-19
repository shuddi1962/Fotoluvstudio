'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import type { Profile, Event } from '@/types/database'

export default function AdminClientsPage() {
  const [clients, setClients] = useState<(Profile & { events?: Event[] })[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { loadClients() }, [])

  const loadClients = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*, events(*)')
      .in('role', ['client', 'admin'])
      .order('created_at', { ascending: false })
    setClients(profiles || [])
    setLoading(false)
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-headline">Client Management</h1>
      </div>
      {clients.length === 0 ? (
        <EmptyState title="No clients yet" />
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <Link key={client.id} href={`/admin/clients/${client.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{client.full_name || 'Unnamed Client'}</p>
                    <p className="text-sm text-text-muted">{client.events?.length || 0} events</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {client.is_gold_member && <Badge variant="gold">Gold</Badge>}
                    <Badge>{client.role}</Badge>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
