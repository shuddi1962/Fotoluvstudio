'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import Spinner from '@/components/ui/Spinner'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    check()
    async function check() {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/login')
        return
      }
      setChecking(false)
    }
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-bg flex">
      <DashboardSidebar role="admin" offersCommissions={false} />
      <main className="flex-1 lg:ml-64 transition-all duration-300 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
