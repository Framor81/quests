'use client'
import supabase from '../lib/supabaseClient'
import { useState, useMemo } from 'react'

type Quest = {
  id: string
  name: string
  description: string
  category: string
  duration: number
  city: string
  state: string
  xp: number
  num_volunteers: number
  current_volunteers: number
}

type Profile = {
  city: string
  state: string
}

export default function ClientQuestFilter({
  quests: initialQuests,
  profile,
  userId,
}: {
  quests: Quest[]
  profile: Profile | null
  userId: string
}) {
  // 💾 Local state to allow re-rendering after updates
  const [quests, setQuests] = useState<Quest[]>(initialQuests)
  const [duration, setDuration] = useState('')
  const [category, setCategory] = useState('')
  const [sameLocation, setSameLocation] = useState(false)

  const filteredQuests = useMemo(() => {
    return quests.filter((quest) => {
      const matchesDuration = duration
        ? quest.duration === Number(duration)
        : true
      const matchesCategory = category ? quest.category === category : true
      const matchesLocation =
        sameLocation && profile
          ? quest.city === profile.city && quest.state === profile.state
          : true

      return matchesDuration && matchesCategory && matchesLocation
    })
  }, [quests, duration, category, sameLocation, profile])

  const uniqueCategories = Array.from(new Set(quests.map((q) => q.category)))
  const uniqueDurations = Array.from(
    new Set(quests.map((q) => q.duration)),
  ).sort((a, b) => a - b)

  const joinQuest = async (questId: string) => {
    try {
      console.log('🧪 Join button clicked for quest:', questId)

      // Check if user has already joined this quest
      const { data: existingJoin } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_uuid', userId)
        .eq('quest_id', questId)
        .single()

      console.log(existingJoin)

      if (existingJoin) {
        alert('You have already joined this quest!')
        return
      }

      const questIndex = quests.findIndex((q) => q.id === questId)
      if (questIndex === -1) return

      const quest = quests[questIndex]

      // Get the latest volunteer count directly from the database
      const { data: currentQuest } = await supabase
        .from('quests')
        .select('current_volunteers, num_volunteers')
        .eq('id', questId)
        .single()

      if (!currentQuest) {
        alert('Quest not found.')
        return
      }

      if (currentQuest.current_volunteers >= currentQuest.num_volunteers) {
        alert('This quest no longer needs volunteers or is already full.')
        return
      }

      // Use a transaction to ensure data consistency
      const { error } = await supabase.rpc('join_quest', {
        p_user_uuid: userId,
        p_quest_id: questId,
      })

      if (error) {
        console.error('Error joining quest:', error)
        if (error.message.includes('duplicate')) {
          alert('You have already joined this quest!')
        } else {
          alert('Failed to join quest. Please try again.')
        }
        return
      }

      // Refresh the quest data
      const { data: updatedQuest } = await supabase
        .from('quests')
        .select('*')
        .eq('id', questId)
        .single()

      if (updatedQuest) {
        const updatedQuests = [...quests]
        updatedQuests[questIndex] = updatedQuest
        setQuests(updatedQuests)
        alert('Successfully joined the quest!')
      }
    } catch (error) {
      console.error('Error in joinQuest:', error)
      alert('An error occurred. Please try again.')
    }
  }

  return (
    <div className="flex w-full max-w-4xl flex-col gap-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-4 rounded border bg-white p-4 shadow">
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="rounded border px-2 py-1"
        >
          <option value="">All Durations</option>
          {uniqueDurations.map((d) => (
            <option key={d} value={d}>
              {d} hrs
            </option>
          ))}
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded border px-2 py-1"
        >
          <option value="">All Categories</option>
          {uniqueCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={sameLocation}
            onChange={() => setSameLocation(!sameLocation)}
            disabled={!profile}
          />
          Near Me
        </label>
      </div>

      {/* Quest List */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filteredQuests.length > 0 ? (
          filteredQuests.map((quest) => (
            <div
              key={quest.id}
              className="rounded-lg border border-darkbrown bg-white p-4 shadow-lg"
            >
              <h3 className="text-xl font-bold text-red-800">{quest.name}</h3>
              <p className="mb-2 text-sm italic text-gray-700">
                {quest.city}, {quest.state} • {quest.duration} hrs •{' '}
                {quest.category}
              </p>
              <p className="text-sm">{quest.description}</p>
              <p className="mt-2 text-xs text-gray-500">🏆 XP: {quest.xp}</p>
              <p className="text-sm text-gray-600">
                {quest.num_volunteers - quest.current_volunteers} spots left
              </p>

              <button
                className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                onClick={() => joinQuest(quest.id)}
              >
                {quest.current_volunteers >= quest.num_volunteers
                  ? 'No Spots Left'
                  : 'Join Quest'}
              </button>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground">
            No quests found. Try adjusting your filters!
          </p>
        )}
      </div>
    </div>
  )
}
