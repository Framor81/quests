'use client'

import { createBrowserClient } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const categories = [
  'Elderly',
  'Homeless',
  'Environmental',
  'Health',
  'Education',
  'Activism',
  'Social',
  'Pets',
]

export default function ClientQuestCreate() {
  const supabase = createBrowserClient()
  const [formData, setFormData] = useState({
    name: '',
    num_volunteers: 0,
    description: '',
    is_physical: false,
    city: '',
    state: '',
    date: '',
    time: '',
    duration: 0,
    category: categories[0],
    min_age: '',
    current_volunteers: 0,
  })

  const router = useRouter()

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const target = e.target
    const value =
      target instanceof HTMLInputElement && target.type === 'checkbox'
        ? target.checked
        : target.value
    const name = target.name
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const {
      name,
      num_volunteers,
      description,
      is_physical,
      city,
      state,
      date,
      time,
      duration,
      category,
      min_age,
    } = formData

    const { data, error } = await supabase.from('quests').insert([
      {
        name,
        num_volunteers,
        description,
        is_physical,
        city,
        state,
        date,
        time,
        duration,
        category,
        xp: duration * 100,
        min_age: min_age || null,
      },
    ])

    if (error) {
      alert('Error: ' + error.message)
    } else {
      router.push('/')
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <h1 className="pirate-font text-6xl font-extrabold text-darkbrown drop-shadow-lg">
        🏴‍☠️ Launch a New Quest
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-8 rounded-xl border border-yellow-500 bg-card p-8 shadow-xl md:grid-cols-2"
      >
        {/* Left Column */}
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="text-lg font-semibold">
              Quest Name:
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg bg-background p-3"
              required
            />
          </div>

          <div>
            <label htmlFor="num_volunteers" className="text-lg font-semibold">
              Volunteers Needed:
            </label>
            <input
              type="number"
              name="num_volunteers"
              id="num_volunteers"
              value={formData.num_volunteers}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg bg-background p-3"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="text-lg font-semibold">
              Description:
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg bg-background p-3"
              rows={5}
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-lg font-semibold">
              Is it Physical Labor?
            </label>
            <input
              type="checkbox"
              name="is_physical"
              checked={formData.is_physical}
              onChange={handleChange}
              className="h-5 w-5"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="city" className="text-lg font-semibold">
                City:
              </label>
              <input
                type="text"
                name="city"
                id="city"
                value={formData.city}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg bg-background p-3"
                required
              />
            </div>
            <div>
              <label htmlFor="state" className="text-lg font-semibold">
                State:
              </label>
              <input
                type="text"
                name="state"
                id="state"
                value={formData.state}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg bg-background p-3"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="text-lg font-semibold">
                Date:
              </label>
              <input
                type="date"
                name="date"
                id="date"
                value={formData.date}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg bg-background p-3"
                required
              />
            </div>
            <div>
              <label htmlFor="time" className="text-lg font-semibold">
                Time:
              </label>
              <input
                type="time"
                name="time"
                id="time"
                value={formData.time}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg bg-background p-3"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="duration" className="text-lg font-semibold">
              Duration (hrs):
            </label>
            <input
              type="number"
              name="duration"
              id="duration"
              value={formData.duration}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg bg-background p-3"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="text-lg font-semibold">
              Category:
            </label>
            <select
              name="category"
              id="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg bg-background p-3"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="min_age" className="text-lg font-semibold">
              Minimum Age (if any):
            </label>
            <input
              type="number"
              name="min_age"
              id="min_age"
              value={formData.min_age}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg bg-background p-3"
              placeholder="Optional"
              min={0}
            />
          </div>
        </div>

        <div className="col-span-1 md:col-span-2">
          <button
            type="submit"
            className="pirate-font w-full rounded-lg bg-yellow-400 p-4 text-xl font-bold text-black shadow hover:bg-yellow-300"
          >
            ⚓ Submit Quest!
          </button>
        </div>
      </form>
    </main>
  )
} 