import ClientQuestCreate from '@/components/ClientQuestCreate'
import Navigation from '@/components/Navigation'
import { createServerClient } from '@/utils/supabase'
import { cookies } from 'next/headers'

export default async function CreateQuestPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
    const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="inter-font flex min-h-screen w-full flex-col items-center bg-brown text-black">
        <Navigation />
        <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <p className="mt-10 text-center">Please log in to create quests.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="inter-font flex min-h-screen w-full flex-col items-center bg-brown text-black">
      <Navigation />
      <ClientQuestCreate />
    </div>
  )
}

