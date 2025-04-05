import Navigation from '@/components/Navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@/utils/supabase'
import ThemeToggle from '@/components/ThemeToggle'

export default async function Index() {
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
    <div className="flex min-h-screen w-full flex-col items-center justify-between bg-background text-foreground">
      <Navigation />

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="pirate-font text-6xl font-extrabold text-primary drop-shadow-lg">
          🏴‍☠️ Adventeer
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Welcome to{' '}
          <span className="font-semibold text-primary">Adventeer</span> — the
          pirate-themed adventure guild for giving back! ⚓️
          <br />
          Join quests like volunteering at marathons, soup kitchens, and local
          events.
          <br />
          Form parties with your crew, earn badges, and level up your impact!
        </p>

        {isSupabaseConnected ? (
          <a
            href="/dashboard"
            className="mt-10 rounded-md bg-primary px-6 py-3 text-lg font-bold text-primary-foreground transition hover:bg-accent"
          >
            Start Your Quest
          </a>
        ) : (
          <p className="mt-10 text-sm text-destructive">
            ⚠️ Supabase not connected. Please configure your backend.
          </p>
        )}
      </main>

      <footer className="w-full border-t border-border p-6 text-center text-xs text-muted-foreground">
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
      </footer>
    </div>
  )
}
