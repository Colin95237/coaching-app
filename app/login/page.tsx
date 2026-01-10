'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/customers')
    }
  }

  async function handleSignup() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      alert('Registrierung erfolgreich! Bitte E-Mail prüfen.')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold mb-6">Login</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="E-Mail"
          className="border p-2 w-full rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Passwort"
          className="border p-2 w-full rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-600">{error}</p>}

        <button className="bg-black text-white w-full py-2 rounded">
          Login
        </button>
      </form>

      <button
        onClick={handleSignup}
        className="mt-4 text-sm underline"
      >
        Neu registrieren
      </button>
    </div>
  )
}