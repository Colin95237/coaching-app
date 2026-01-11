'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

/* -----------------------------
   Typen
-------------------------------- */

type Customer = {
  id: string
  name: string
  email: string
}

type Session = {
  id: string
  title: string
  start_time: string
  end_time: string
  status: string
  customers: Customer
}

/* -----------------------------
   Page Component
-------------------------------- */

export default function SessionsPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sessions, setSessions] = useState<Session[]>([])

  const [customerId, setCustomerId] = useState('')
  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const [loading, setLoading] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true) // Auth-Check

  /* -----------------------------
     Daten laden
  -------------------------------- */

  async function loadCustomers() {
    const res = await fetch('/api/customers')
    setCustomers(await res.json())
  }

  async function loadSessions() {
    const res = await fetch('/api/sessions')
    setSessions(await res.json())
  }

  useEffect(() => {
    // Prüfen, ob User eingeloggt ist
    async function checkUser() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        // Wenn kein User, weiterleiten auf Login
        window.location.href = '/login'
        return
      }

      // User ist angemeldet → Daten laden
      setLoadingAuth(false)
      loadCustomers()
      loadSessions()
    }

    checkUser()
  }, [])

  /* -----------------------------
     Logout
  -------------------------------- */
  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  /* -----------------------------
     Session erstellen
  -------------------------------- */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        title,
        startTime,
        endTime,
      }),
    })

    setCustomerId('')
    setTitle('')
    setStartTime('')
    setEndTime('')
    setLoading(false)

    loadSessions()
  }

  /* -----------------------------
     Session abschließen + Rechnung
  -------------------------------- */

  async function completeSession(sessionId: string) {
    const res = await fetch(`/api/sessions/${sessionId}/complete`, { method: 'POST' })
    const data = await res.json()

    if (data.pdf) {
      const link = document.createElement('a')
      link.href = data.pdf
      link.download = `rechnung-${sessionId}.pdf`
      link.click()
    }

    loadSessions()
  }

  /* -----------------------------
     Render
  -------------------------------- */

  if (loadingAuth) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <p>Lade Benutzerinformationen...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Logout Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Sessions</h1>

      {/* -------- Formular -------- */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <select
          className="border p-2 w-full rounded"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          required
        >
          <option value="">Kunde auswählen</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.email})
            </option>
          ))}
        </select>

        <input
          className="border p-2 w-full rounded"
          placeholder="Titel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="datetime-local"
          className="border p-2 w-full rounded"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />

        <input
          type="datetime-local"
          className="border p-2 w-full rounded"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading ? 'Speichern...' : 'Session anlegen'}
        </button>
      </form>

      {/* -------- Session Liste -------- */}
      <ul className="space-y-3">
        {sessions.map((s) => (
          <li key={s.id} className="border p-4 rounded">
            <strong>{s.title}</strong><br />
            Kunde: {s.customers.name}<br />
            Start: {new Date(s.start_time).toLocaleString('de-DE')}<br />
            Status: {s.status}

            {s.status !== 'completed' && (
              <button
                className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
                onClick={() => completeSession(s.id)}
              >
                Session abschließen & Rechnung
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
