import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { supabase } from '../lib/supabase'
import ProfileForm from '../components/ProfileForm'

function Profile() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    async function fetchProfile() {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)

      if (data && data.length > 0) {
        setProfile(data[0])
      } else {
        const newProfile = {
          user_id: user.id,
          display_name: user.firstName || '',
          goals: [],
          interests: [],
          skills: [],
        }
        const { data: created } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single()
        setProfile(created)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [user])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Your Profile</h1>
          <p className="text-gray-400 mt-1">Help us connect you with the right people</p>
        </div>
        {profile && (
          <ProfileForm profile={profile} userId={user.id} onSave={() => navigate('/courses')} />
        )}
      </div>
    </div>
  )
}

export default Profile
