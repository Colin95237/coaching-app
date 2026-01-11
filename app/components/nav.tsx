import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="p-4 border-b flex gap-4">
      <Link href="/customers">Kunden</Link>
      <Link href="/sessions">Sessions</Link>
      <Link href="/dashboard" className="font-semibold">
        Dashboard
      </Link>
    </nav>
  )
}