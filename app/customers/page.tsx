'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Customer = {
  id: string
  name: string
  email: string
  address: string | null
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [user, setUser] = useState<any>(null) // Schritt 5: aktueller User

  /* -----------------------------
     Kunden laden
  ----------------------------- */
  async function loadCustomers() {
    try {
      const res = await fetch('/api/customers')
      const data = await res.json()
      setCustomers(data)
    } catch (err) {
      console.error('Fehler beim Laden der Kunden:', err)
    }
  }

  /* -----------------------------
     Auth prüfen + User setzen
  ----------------------------- */
  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser()
      console.log('Current User:', data.user) // Schritt 5: console.log

      if (!data.user) {
        window.location.href = '/login'
        return
      }

      setUser(data.user) // User im State speichern
      setLoadingAuth(false)
      loadCustomers()
    }

    checkUser()
  }, [])

  /* -----------------------------
     Logout
  ----------------------------- */
  async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Fehler beim Logout:', error)
      return
    }
    window.location.href = '/login'
  }

  /* -----------------------------
     Kunde erstellen
  ----------------------------- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, address }),
      })

      setName('')
      setEmail('')
      setAddress('')
      loadCustomers()
    } catch (err) {
      console.error('Fehler beim Anlegen des Kunden:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loadingAuth) {
    return <p>Lädt…</p>
  }

  /* -----------------------------
     Render
  ----------------------------- */
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kunden</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      {/* Formular */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          placeholder="Name"
          className="w-full border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="E-Mail"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Adresse"
          className="w-full border p-2 rounded"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading ? 'Speichern...' : 'Kunde anlegen'}
        </button>
      </form>

      {/* Kundenliste */}
      <ul className="space-y-2">
        {customers.map((customer) => (
          <li key={customer.id} className="border p-3 rounded">
            <strong>{customer.name}</strong>
            <br />
            {customer.email}
            <br />
            {customer.address}
          </li>
        ))}
      </ul>
    </div>
  )
}