import { useState } from 'react'
import { Link } from 'react-router-dom'
import SkillTag from './SkillTag'
import NewMessageModal from './NewMessageModal'

const expColors = {
  brand_new: 'bg-green-900 text-green-300',
  some_experience: 'bg-blue-900 text-blue-300',
  self_taught: 'bg-purple-900 text-purple-300',
  student: 'bg-yellow-900 text-yellow-300',
  working_professional: 'bg-teal-900 text-teal-300',
  career_changer: 'bg-orange-900 text-orange-300',
}
const expLabels = {
  brand_new: 'Brand New', some_experience: 'Some Experience', self_taught: 'Self-Taught',
  student: 'Student', working_professional: 'Professional', career_changer: 'Career Changer',
}

function MemberCard({ profile, currentUserId, mySkills, matchReason }) {
  const [showMsg, setShowMsg] = useState(false)
  const isMe = profile.user_id === currentUserId

  const sortedSkills = [...(profile.skills || [])].sort((a, b) => {
    const order = { confident: 0, comfortable: 1, learning: 2 }
    return (order[a.level] || 3) - (order[b.level] || 3)
  })

  const mySkillNames = (mySkills || []).map((s) => s.name.toLowerCase())

  return (
    <>
      <div className="bg-[#1e293b] rounded-2xl border border-gray-700 p-5 hover:-translate-y-0.5 hover:border-gray-600 transition-all duration-200 flex flex-col">
        {/* Match reason */}
        {matchReason && (
          <p className="text-[10px] text-green-400 mb-2 font-medium">{matchReason}</p>
        )}

        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-lg font-bold shrink-0">
            {(profile.display_name || '?')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold truncate">{profile.display_name || 'Anonymous'}</p>
            {(profile.location || profile.parish) && (
              <p className="text-xs text-gray-500 truncate">{[profile.location, profile.parish ? `${profile.parish} Parish` : null].filter(Boolean).join(', ')}</p>
            )}
            {profile.experience_level && (
              <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${expColors[profile.experience_level] || 'bg-gray-700 text-gray-300'}`}>
                {expLabels[profile.experience_level] || profile.experience_level}
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-3">{profile.bio}</p>
        )}

        {/* Skills */}
        {sortedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {sortedSkills.slice(0, 6).map((s) => (
              <span key={s.name} className={mySkillNames.includes(s.name.toLowerCase()) ? 'ring-1 ring-green-500/40 rounded-full' : ''}>
                <SkillTag name={s.name} level={s.level} />
              </span>
            ))}
            {sortedSkills.length > 6 && <span className="text-xs text-gray-600 self-center">+{sortedSkills.length - 6} more</span>}
          </div>
        )}

        {/* Goals */}
        {(profile.goals || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {profile.goals.slice(0, 3).map((g) => (
              <span key={g} className="text-[10px] px-2 py-0.5 rounded-full border border-gray-700 text-gray-500">{g}</span>
            ))}
            {profile.goals.length > 3 && <span className="text-[10px] text-gray-600 self-center">+{profile.goals.length - 3}</span>}
          </div>
        )}

        {/* Community badges */}
        {(profile.open_to_mentor || profile.looking_for_mentor || profile.open_to_collaborate) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {profile.open_to_mentor && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-900/50 text-green-400">🎓 Mentor</span>}
            {profile.looking_for_mentor && <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-900/50 text-yellow-400">🔍 Seeking Mentor</span>}
            {profile.open_to_collaborate && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-400">🤝 Collaborate</span>}
          </div>
        )}

        {/* Progress */}
        {profile.completionPct != null && (
          <div className="mb-4">
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-500/60 rounded-full" style={{ width: `${profile.completionPct}%` }} />
            </div>
            <p className="text-[10px] text-gray-600 mt-1">{profile.completionPct}% course progress</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          <Link to={`/member/${profile.user_id}`} className="flex-1 text-center py-2 border border-gray-700 text-gray-400 text-xs font-medium rounded-lg hover:border-gray-500 hover:text-gray-200 transition-colors">
            View Profile
          </Link>
          {!isMe && (
            <button onClick={() => setShowMsg(true)} className="flex-1 py-2 border border-green-500/50 text-green-400 text-xs font-medium rounded-lg hover:bg-green-500/10 transition-colors">
              Message
            </button>
          )}
        </div>
      </div>

      <NewMessageModal isOpen={showMsg} onClose={() => setShowMsg(false)} prefillUserId={profile.user_id} currentUserId={currentUserId} />
    </>
  )
}

export default MemberCard
