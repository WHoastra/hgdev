import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useUserId } from '../lib/useUserId'
import CommunityStats from '../components/CommunityStats'
import CommunitySearch from '../components/CommunitySearch'
import CommunityFilters from '../components/CommunityFilters'
import MemberCard from '../components/MemberCard'

function Community() {
  const { userId } = useUserId()
  const [profiles, setProfiles] = useState([])
  const [myProfile, setMyProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ parish: 'all', experience: 'all', availability: 'all', role: 'all', skills: [] })
  const [sort, setSort] = useState('active')
  const [showSuggestions, setShowSuggestions] = useState(true)

  useEffect(() => {
    if (!userId) return

    async function fetchAll() {
      const { data: allProfiles } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('is_public', true)

      // Fetch progress for completion percentages
      const { data: allProgress } = await supabase.from('progress').select('user_id, status')

      const progressByUser = {}
      const { data: lessons } = await supabase.from('lessons').select('id')
      const totalLessons = lessons?.length || 1

      for (const p of allProgress || []) {
        if (!progressByUser[p.user_id]) progressByUser[p.user_id] = { complete: 0 }
        if (p.status === 'complete') progressByUser[p.user_id].complete++
      }

      const enriched = (allProfiles || []).map((p) => ({
        ...p,
        completionPct: Math.round(((progressByUser[p.user_id]?.complete || 0) / totalLessons) * 100),
      }))

      setProfiles(enriched)
      const mine = enriched.find((p) => p.user_id === userId)
      setMyProfile(mine || null)
      setLoading(false)
    }

    fetchAll()
  }, [userId])

  // Filter and search
  const otherProfiles = useMemo(() => profiles.filter((p) => p.user_id !== userId), [profiles, userId])

  const filtered = useMemo(() => {
    return otherProfiles.filter((p) => {
      // Text search
      if (search.trim()) {
        const q = search.toLowerCase()
        const fields = [
          p.display_name, p.location, p.parish, p.bio,
          ...(p.skills || []).map((s) => s.name),
          ...(p.interests || []),
          ...(p.goals || []),
        ].filter(Boolean).map((f) => f.toLowerCase())
        if (!fields.some((f) => f.includes(q))) return false
      }
      if (filters.parish !== 'all' && p.parish !== filters.parish) return false
      if (filters.experience !== 'all' && p.experience_level !== filters.experience) return false
      if (filters.availability !== 'all' && p.availability !== filters.availability) return false
      if (filters.role === 'mentors' && !p.open_to_mentor) return false
      if (filters.role === 'seeking_mentor' && !p.looking_for_mentor) return false
      if (filters.role === 'collaborators' && !p.open_to_collaborate) return false
      return true
    }).sort((a, b) => {
      if (sort === 'active') return new Date(b.updated_at) - new Date(a.updated_at)
      if (sort === 'newest') return new Date(b.created_at) - new Date(a.created_at)
      if (sort === 'skills') return (b.skills?.length || 0) - (a.skills?.length || 0)
      if (sort === 'progress') return (b.completionPct || 0) - (a.completionPct || 0)
      if (sort === 'name') return (a.display_name || '').localeCompare(b.display_name || '')
      return 0
    })
  }, [otherProfiles, search, filters, sort])

  // Suggestions
  const suggestions = useMemo(() => {
    if (!myProfile?.profile_complete || !showSuggestions) return []
    const mySkillNames = (myProfile.skills || []).map((s) => s.name.toLowerCase())
    const myGoals = myProfile.goals || []

    return otherProfiles
      .map((p) => {
        const reasons = []
        if (p.parish && p.parish === myProfile.parish) reasons.push('Same parish')
        const sharedSkills = (p.skills || []).filter((s) => mySkillNames.includes(s.name.toLowerCase())).length
        if (sharedSkills >= 2) reasons.push(`${sharedSkills} shared skills`)
        if (myProfile.looking_for_mentor && p.open_to_mentor) reasons.push('Offering mentorship')
        if (myProfile.open_to_mentor && p.looking_for_mentor) reasons.push('Seeking mentorship')
        const sharedGoals = (p.goals || []).filter((g) => myGoals.includes(g)).length
        if (sharedGoals >= 2) reasons.push('Similar goals')
        return reasons.length > 0 ? { ...p, matchReason: reasons.join(' · ') } : null
      })
      .filter(Boolean)
      .slice(0, 3)
  }, [otherProfiles, myProfile, showSuggestions])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">The Network</h1>
          <p className="text-gray-400 mt-1">Find developers, mentors, and collaborators in Southern Louisiana</p>
          <p className="text-xs text-green-500 mt-2">Every connection you make strengthens the community</p>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <CommunityStats profiles={otherProfiles} />
        </div>

        {/* Profile prompt */}
        {!myProfile?.profile_complete && (
          <div className="bg-[#1e293b] border border-green-500/30 rounded-lg p-4 mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-300">Complete your profile so others can find and connect with you.</p>
            <Link to="/profile" className="px-4 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-500 transition-colors shrink-0">
              Set Up Profile
            </Link>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">People you might want to connect with</h2>
              <button onClick={() => setShowSuggestions(false)} className="text-gray-600 hover:text-gray-400 text-xs">Dismiss</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestions.map((p) => (
                <MemberCard key={p.user_id} profile={p} currentUserId={userId} mySkills={myProfile?.skills} matchReason={p.matchReason} />
              ))}
            </div>
          </div>
        )}

        {/* Search + Filters */}
        <div className="space-y-4 mb-6">
          <CommunitySearch onSearch={setSearch} />
          <CommunityFilters filters={filters} onFilterChange={setFilters} profiles={otherProfiles} />
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500">Showing {filtered.length} of {otherProfiles.length} members</p>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="bg-[#1e293b] border border-gray-700 text-gray-400 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-green-500">
            <option value="active">Most Active</option>
            <option value="newest">Newest</option>
            <option value="skills">Most Skills</option>
            <option value="progress">Most Progress</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-2">No members match your search</p>
            <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or search terms</p>
            <button onClick={() => { setSearch(''); setFilters({ parish: 'all', experience: 'all', availability: 'all', role: 'all', skills: [] }) }}
              className="text-sm text-green-400 hover:text-green-300">Clear all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <MemberCard key={p.user_id} profile={p} currentUserId={userId} mySkills={myProfile?.skills} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Community
