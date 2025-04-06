// app/map/page.tsx
import { createServerClient } from '@/utils/supabase'
import { cookies } from 'next/headers'
import MapPage from './map'

export default async function MapPageWrapper() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('xp')
    .eq('uuid', user?.id)
    .single()

  const xp = profile?.xp || 0
  const level = Math.floor(Math.sqrt(xp / 5))

  return <MapPage userId={user?.id || 'guest'} level={level} />
}
