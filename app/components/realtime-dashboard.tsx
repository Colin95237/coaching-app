'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function RealtimeDashboard() {
  const [stats, setStats] = useState({
    openInvoices: 0,
    plannedSessions: 0,
    overdueInvoices: 0,
    loading: true
  })

  useEffect(() => {
    loadStats()

    const channel = supabase
      .channel('dashboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        () => loadStats()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadStats() {
    const [
      openInvoices,
      plannedSessions,
      overdueInvoices
    ] = await Promise.all([
      supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sent'),

      supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'planned'),

      supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'overdue')
    ])

    setStats({
      openInvoices: openInvoices.count || 0,
      plannedSessions: plannedSessions.count || 0,
      overdueInvoices: overdueInvoices.count || 0,
      loading: false
    })
  }

  if (stats.loading) {
    return <p>Lade Dashboard…</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <DashboardCard
        title="Offene Rechnungen"
        value={stats.openInvoices}
        color="blue"
      />
      <DashboardCard
        title="Geplante Sessions"
        value={stats.plannedSessions}
        color="green"
      />
      <DashboardCard
        title="Überfällig"
        value={stats.overdueInvoices}
        color="red"
      />
    </div>
  )
}

function DashboardCard({
  title,
  value,
  color
}: {
  title: string
  value: number
  color: 'blue' | 'green' | 'red'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700'
  }

  return (
    <div className={`p-6 rounded-xl shadow ${colors[color]}`}>
      <h2 className="text-sm font-medium mb-2">{title}</h2>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}