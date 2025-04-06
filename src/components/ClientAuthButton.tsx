'use client'

import { createBrowserClient } from '@/utils/supabase'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ClientAuthButton() {
  const [user, setUser] = useState<any>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return user ? (
    <div className="flex items-center gap-4">
      <Link href="/profile" className="text-sm hover:underline">
        {user.email}
      </Link>
      <button
        onClick={handleSignOut}
        className="rounded-md bg-btn-background px-4 py-2 text-sm text-btn-background hover:bg-btn-background-hover"
      >
        Sign Out
      </button>
    </div>
  ) : (
    <Link
      href="/login"
      className="rounded-md bg-btn-background px-4 py-2 text-sm text-btn-background hover:bg-btn-background-hover"
    >
      Sign In
    </Link>
  )
} 