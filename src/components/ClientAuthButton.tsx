'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ClientAuthButton() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (loading) {
    return <div className="h-10 w-20 bg-gray-200 animate-pulse rounded-md" />
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="bg-btn-background hover:bg-btn-background-hover flex rounded-md px-3 py-2 no-underline"
      >
        Login
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm">Hey, {user.email}!</span>
      <button 
        onClick={handleSignOut}
        className="bg-btn-background hover:bg-btn-background-hover rounded-md px-4 py-2 no-underline"
      >
        Logout
      </button>
    </div>
  )
} 