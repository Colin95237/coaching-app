'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import RealtimeDashboard from '../components/realtime-dashboard'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Prüfen, ob ein User eingeloggt ist
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/login') // nicht eingeloggt → zum Login
      } else {
        setUser(data.session.user)
        setLoading(false)
      }
    })
  }, [router])

  if (loading) return <p>Lade Dashboard...</p>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <RealtimeDashboard />
    </div>
  )
}