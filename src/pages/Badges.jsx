import { useState, useEffect } from 'react'
import { useUserId } from '../lib/useUserId'
import { getUserBadges, getAllBadgeDefinitions } from '../lib/badges'
import Badge from '../components/Badge'

const categoryLabels = {
  learning: '🎯 Learning Milestones',
  consistency: '🔥 Consistency & Effort',
  community: '🤝 Community',
  profile: '👤 Profile & Identity',
  special: '⭐ Special',
}

function Badges() {
  const { userId } = useUserId()
  const [allDefs, setAllDefs] = useState([])
  const [earned, setEarned] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    Promise.all([getAllBadgeDefinitions(), getUserBadges(userId)]).then(([defs, badges]) => {
      setAllDefs(defs)
      setEarned(badges)
      setLoading(false)
    })
  }, [userId])

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>

  const earnedIds = new Set(earned.map((b) => b.id))
  const earnedMap = {}
  earned.forEach((b) => { earnedMap[b.id] = b })
  const totalPct = allDefs.length > 0 ? Math.round((earned.length / allDefs.length) * 100) : 0

  const categories = ['learning', 'consistency', 'community', 'profile', 'special']

  return (
    <div className="animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Your Badges</h1>
          <p className="text-gray-400 mt-1">Collect them all — every badge represents real progress</p>
        </div>

        {/* Stats */}
        <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white font-medium">{earned.length} of {allDefs.length} badges earned</span>
            <span className="text-xs text-gray-400">{totalPct}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-green-500 rounded-full transition-all duration-700" style={{ width: `${totalPct}%` }} />
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            {['common', 'uncommon', 'rare', 'epic', 'legendary'].map((r) => (
              <span key={r}>{earned.filter((b) => b.rarity === r).length} {r}</span>
            ))}
          </div>
        </div>

        {/* Recently earned */}
        {earned.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-white mb-4">Recently Earned</h2>
            <div className="flex gap-6 overflow-x-auto pb-2">
              {earned.slice(0, 5).map((b) => (
                <Badge key={b.id} badge={b} earned size="medium" showDetails />
              ))}
            </div>
          </div>
        )}

        {/* All badges by category */}
        {categories.map((cat) => {
          const badges = allDefs.filter((d) => d.category === cat)
          const catEarned = badges.filter((d) => earnedIds.has(d.id)).length
          return (
            <div key={cat} className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">{categoryLabels[cat]}</h2>
                <span className="text-xs text-gray-500">{catEarned} of {badges.length}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {badges.map((def) => (
                  <Badge key={def.id} badge={earnedIds.has(def.id) ? { ...def, earned_at: earnedMap[def.id]?.earned_at } : def} earned={earnedIds.has(def.id)} size="medium" showDetails />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Badges
