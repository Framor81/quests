import Navigation from '@/components/Navigation'
import { createServerClient } from '@/utils/supabase'
import { cookies } from 'next/headers'

import ClientQuestFilter from '@/components/ClientQuestFilter'
import { Suspense } from 'react'

export default async function BulletinPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p className="mt-10 text-center">Please log in to view quests.</p>
  }

  // Get user profile (for city & state)
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('uuid', user.id)
    .single()

  console.log(profile)
  // Get all quests
  const { data: quests } = await supabase.from('quests').select('*')

  return (
    <div className="inter-font flex min-h-screen w-full flex-col bg-brown text-black">
      <Navigation />
      <main className="flex flex-col items-center px-4 pb-20">
        <h1 className="pirate-font my-10 text-5xl font-extrabold text-darkbrown drop-shadow-lg">
          🗺️ Quest Bulletin Board
        </h1>

        <Suspense fallback={<p>Loading filters...</p>}>
          <ClientQuestFilter
            quests={quests ?? []}
            profile={profile}
            userId={user.id}
          />
        </Suspense>
      </main>
    </div>
  )
}
