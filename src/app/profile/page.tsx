'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/utils/supabase'

const ProfilePage = () => {
  const supabase = createBrowserClient()
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    state: '',
    city: '',
  })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error('User not found:', userError)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('users') // Changed from 'profiles' to 'users'
        .select('*')
        .eq('uuid', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
      } else if (data) {
        setProfile(data)
        setFormData({
          name: data.name || '',
          age: data.age || '',
          state: data.state || '',
          city: data.city || '',
        })
      }

      setLoading(false)
    }

    fetchProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const updates = {
      uuid: user.id,
      ...formData,
    }

    const { data, error } = await supabase
      .from('users') // Changed from 'profiles' to 'users'
      .upsert(updates)
      .select()
      .single()

    if (error) {
      console.error('Error saving profile:', error)
    } else {
      setProfile(data)
      setEditing(false)
    }

    setLoading(false)
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className=" flex min-h-screen w-full flex-col items-center justify-center bg-brown text-darkbrown">
      <h1 className="pirate-font mt-10 text-5xl font-bold text-darkbrown drop-shadow-lg">
        👤 Profile
      </h1>

      {!profile || editing ? (
        <div className="space-y-6">
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

          {/* Age */}
          <div className="form-group">
            <label htmlFor="age" className="text-lg font-semibold">
              Age:
            </label>
            <input
              type="number"
              name="age"
              id="age"
              value={formData.age}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg bg-card p-3 text-card-foreground"
            />
          </div>

          {/* City */}
          <div className="form-group">
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

          {/* State */}
          <div className="form-group">
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
          <button
            className="rounded bg-white px-4 py-2 hover:bg-gray-300"
            onClick={handleSubmit}
          >
            Save Profile
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Name */}
          <div className="form-group">
            <p className="text-lg font-semibold">
              <strong>Name:</strong> {profile.name}
            </p>
          </div>

          {/* Age */}
          <div className="form-group">
            <p className="text-lg font-semibold">
              <strong>Age:</strong> {profile.age}
            </p>
          </div>

          {/* Location */}
          <div className="form-group">
            <p className="text-lg font-semibold">
              <strong>Location:</strong> {profile.city}, {profile.state}
            </p>
          </div>

          {/* XP */}
          <div className="form-group">
            <p className="text-lg font-semibold">
              <strong>XP:</strong> {profile.xp ?? 0}
            </p>
          </div>
          <button
            className="mt-4 rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  )
}

const InputField = ({ label, name, value, onChange, type = 'text' }) => (
  <div>
    <label className="mb-1 block text-sm font-medium">{label}</label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      className="w-full rounded border px-3 py-2"
    />
  </div>
)

export default ProfilePage
