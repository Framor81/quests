'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import RedirectButton from '@/components/RedirectButton'

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

const OrganizerPage = () => {
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
    min_age: '', // Only track minimum age now
  })

  const router = useRouter()

  // Handle form data change
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

  // Handle form submission
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

    // Insert quest data into Supabase
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
        xp: 0, // Default xp, could be calculated based on duration or type
        min_age: min_age || null, // Add min_age only if provided
      },
    ])

    if (error) {
      alert('Error: ' + error.message)
    } else {
      // Redirect after form submission is successful
      router.push('/') // Redirect to the list of quests
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <h1 className="pirate-font mt-10 text-5xl font-bold text-yellow-400 drop-shadow-lg">
        🏴‍☠️ Create a New Quest
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 w-full max-w-4xl space-y-6">
        {/* Quest Name */}
        <div className="form-group">
          <label htmlFor="name" className="text-lg font-semibold">
            Quest Name:
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-2 w-full rounded-lg bg-card p-3 text-card-foreground"
            required
          />
        </div>

        {/* Number of Volunteers */}
        <div className="form-group">
          <label htmlFor="num_volunteers" className="text-lg font-semibold">
            Number of Volunteers Needed:
          </label>
          <input
            type="number"
            name="num_volunteers"
            id="num_volunteers"
            value={formData.num_volunteers}
            onChange={handleChange}
            className="mt-2 w-full rounded-lg bg-card p-3 text-card-foreground"
            required
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="text-lg font-semibold">
            Description:
          </label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-2 w-full rounded-lg bg-card p-3 text-card-foreground"
            rows={5}
            required
          />
        </div>

        {/* Is it Physical Labor? */}
        <div className="form-group flex items-center gap-3">
          <label className="text-lg font-semibold">Is it Physical Labor?</label>
          <input
            type="checkbox"
            name="is_physical"
            checked={formData.is_physical}
            onChange={handleChange}
            className="h-5 w-5"
          />
        </div>

        {/* City and State */}
        <div className="form-group flex gap-6">
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
              className="mt-2 w-full rounded-lg bg-card p-3 text-card-foreground"
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
              className="mt-2 w-full rounded-lg bg-card p-3 text-card-foreground"
              required
            />
          </div>
        </div>

        {/* Date and Time */}
        <div className="form-group flex gap-6">
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
              className="mt-2 w-full rounded-lg bg-card p-3 text-card-foreground"
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
              className="mt-2 w-full rounded-lg bg-card p-3 text-card-foreground"
              required
            />
          </div>
        </div>

        {/* Duration */}
        <div className="form-group">
          <label htmlFor="duration" className="text-lg font-semibold">
            Time Commitment (in hours):
          </label>
          <input
            type="number"
            name="duration"
            id="duration"
            value={formData.duration}
            onChange={handleChange}
            className="mt-2 w-full rounded-lg bg-card p-3 text-card-foreground"
            required
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category" className="text-lg font-semibold">
            Category:
          </label>
          <select
            name="category"
            id="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-2 w-full rounded-lg bg-card p-3 text-card-foreground"
            required
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Minimum Age */}
        <div className="form-group">
          <label htmlFor="min_age" className="text-lg font-semibold">
            Minimum Age (if applicable):
          </label>
          <input
            type="number"
            name="min_age"
            id="min_age"
            value={formData.min_age}
            onChange={handleChange}
            className="mt-2 w-full rounded-lg bg-card p-3 text-card-foreground"
            placeholder="Enter minimum age"
            min={0}
          />
        </div>

        {/* Submit button */}
        <RedirectButton
          label="Submit"
          route="/" // Corrected route
          bgColor="bg-yellow-400"
          hoverColor="hover:bg-yellow-300"
        />
      </form>
    </div>
  )
}

export default OrganizerPage
