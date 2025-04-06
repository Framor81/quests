import { createServerClient } from '@/utils/supabase'
import { cookies } from 'next/headers'
import Link from 'next/link'
import AuthButton from './AuthButton'

export default async function Navigation() {
  const cookieStore = cookies()
  const canInitSupabaseClient = () => {
    try {
      createServerClient(cookieStore)
      return true
    } catch (e) {
      return false
    }
  }

  const isSupabaseConnected = canInitSupabaseClient()

  return (
    <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10">
      <div className="flex w-full max-w-4xl items-center justify-between p-3 text-sm">
        <div className="flex items-center gap-6">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
          <Link href="/create" className="hover:underline">
            Create Quest
          </Link>
          <Link href="/bulletin" className="hover:underline">
            Quests
          </Link>
        </div>
        {isSupabaseConnected && <AuthButton />}
      </div>
    </nav>
  )
}
