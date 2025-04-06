import { createServerClient } from '@/utils/supabase'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function AuthButton() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const signOut = async () => {
    'use server'

    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    await supabase.auth.signOut()
  }

  return user ? (
    <div className="flex items-center gap-4">
      <Link href="/profile" className="text-sm hover:underline">
        {user.email}
      </Link>
      <form action={signOut}>
        <button className="rounded-md bg-btn-background px-4 py-2 text-sm text-btn-background hover:bg-btn-background-hover">
          Sign Out
        </button>
      </form>
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