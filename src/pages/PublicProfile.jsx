import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useUserId } from '../lib/useUserId'
import SkillTag from '../components/SkillTag'
import NewMessageModal from '../components/NewMessageModal'

const expLabels = {
  brand_new: 'Brand New',
  some_experience: 'Some Experience',
  self_taught: 'Self-Taught',
  student: 'Student',
  working_professional: 'Working Professional',
  career_changer: 'Career Changer',
}

function PublicProfile() {
  const { userId } = useParams()
  const { userId: currentUserId } = useUserId()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const isOwnProfile = currentUserId === userId

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .limit(1)

      if (!data || data.length === 0) {
        setNotFound(true)
      } else if (!data[0].is_public) {
        setProfile(null)
        setNotFound(false)
      } else {
        setProfile(data[0])
      }
      setLoading(false)
    }
    fetchProfile()
  }, [userId])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Profile not found.</p>
          <Link to="/courses" className="text-green-400 hover:text-green-300 text-sm">Back to Courses</Link>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-2">This profile is private.</p>
          <Link to="/courses" className="text-green-400 hover:text-green-300 text-sm">Back to Courses</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/courses" className="inline-flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        {/* Header */}
        <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-6 sm:p-8 mb-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-2xl font-bold shrink-0">
              {(profile.display_name || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{profile.display_name || 'Anonymous'}</h1>
              {(profile.location || profile.parish) && (
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {[profile.location, profile.parish].filter(Boolean).join(', ')}
                </p>
              )}
              {profile.experience_level && (
                <span className="inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full bg-green-900 text-green-300">
                  {expLabels[profile.experience_level] || profile.experience_level}
                </span>
              )}
              {profile.bio && <p className="text-gray-400 text-sm mt-3 leading-relaxed">{profile.bio}</p>}
            </div>
          </div>
        </div>

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => <SkillTag key={s.name} name={s.name} level={s.level} />)}
            </div>
          </div>
        )}

        {/* Goals & Interests */}
        {(profile.goals?.length > 0 || profile.interests?.length > 0) && (
          <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-6 mb-6">
            {profile.goals?.length > 0 && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-white mb-3">Goals</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.goals.map((g) => (
                    <span key={g} className="px-3 py-1 rounded-full text-xs font-medium border border-green-500/50 text-green-400 bg-green-500/10">{g}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.interests?.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-3">Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs font-medium border border-blue-500/50 text-blue-400 bg-blue-500/10">{i}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Community */}
        {(profile.open_to_mentor || profile.looking_for_mentor || profile.open_to_collaborate) && (
          <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">Community</h2>
            <div className="flex flex-wrap gap-2">
              {profile.open_to_mentor && <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">Open to Mentor</span>}
              {profile.looking_for_mentor && <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300">Looking for Mentor</span>}
              {profile.open_to_collaborate && <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-300">Open to Collaborate</span>}
            </div>
          </div>
        )}

        {/* Links */}
        {(profile.github_url || profile.linkedin_url || profile.portfolio_url) && (
          <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">Links</h2>
            <div className="flex flex-wrap gap-4">
              {profile.github_url && <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-green-400 transition-colors">GitHub ↗</a>}
              {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-green-400 transition-colors">LinkedIn ↗</a>}
              {profile.portfolio_url && <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-green-400 transition-colors">Portfolio ↗</a>}
            </div>
          </div>
        )}

        {/* Message */}
        {!isOwnProfile && (
          <div className="text-center">
            <button onClick={() => setShowMessageModal(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-green-500/50 text-green-400 text-sm font-medium rounded-lg hover:bg-green-500/10 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Send Message
            </button>
          </div>
        )}

        <NewMessageModal isOpen={showMessageModal} onClose={() => setShowMessageModal(false)} prefillUserId={userId} currentUserId={currentUserId} />
      </div>
    </div>
  )
}

export default PublicProfile
