import { cookies } from 'next/headers'
import { createServerClient } from '@/utils/supabase'
import Navigation from '@/components/Navigation'
import ThemeToggle from '@/components/ThemeToggle'

import { Suspense } from 'react'
import ClientQuestFilter from '@/components/ClientQuestFilter'

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
      ` {/* Beach Wave Background */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 320"
        className="absolute bottom-0 w-full"
        aria-label="Animated beach waves"
      >
        {/* Background Wave */}
        <path
          fill="#457b9d"
          fillOpacity="0.5"
          d="M0,320 C300,250 600,350 900,300 C1200,250 1500,350 1800,300 L1800,320 L0,320 Z"
        ></path>

        {/* Middle Wave */}
        <path
          fill="#0077b6"
          fillOpacity="0.5"
          d="M0,280 C300,230 600,350 900,280 C1200,230 1500,350 1800,280 L1800,320 L0,320 Z"
        >
          <animate
            attributeName="d"
            dur="8s"
            repeatCount="indefinite"
            values="M0,280 C300,230 600,350 900,280 C1200,230 1500,350 1800,280 L1800,320 L0,320 Z;
              M0,260 C300,210 600,330 900,260 C1200,210 1500,330 1800,260 L1800,320 L0,320 Z;
              M0,280 C300,230 600,350 900,280 C1200,230 1500,350 1800,280 L1800,320 L0,320 Z"
          />
        </path>

        {/* Foreground Wave */}
        <path
          fill="#023e8a"
          fillOpacity=".8"
          dur="5s"
          d="M0,240 C300,190 600,320 900,250 C1200,190 1500,320 1800,250 L1800,320 L0,320 Z"
        >
          <animate
            attributeName="d"
            dur="5s"
            repeatCount="indefinite"
            values="M0,240 C300,190 600,320 900,250 C1200,190 1500,320 1800,250 L1800,320 L0,320 Z;
              M0,220 C300,170 600,310 900,240 C1200,170 1500,310 1800,240 L1800,320 L0,320 Z;
              M0,240 C300,190 600,320 900,250 C1200,190 1500,320 1800,250 L1800,320 L0,320 Z"
          />
        </path>
      </svg>
      {/* <footer className="w-full border-t border-border p-6 text-center text-xs text-muted-foreground">
        Powered by{' '}
        <a
          href="https://supabase.com"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-primary"
        >
          Supabase
        </a>
        . <ThemeToggle />
      </footer> */}
    </div>
  )
}
