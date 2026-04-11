import { useState } from 'react'

const EXP_OPTIONS = ['brand_new','some_experience','self_taught','student','working_professional','career_changer']
const EXP_LABELS = { brand_new:'Brand New', some_experience:'Some Experience', self_taught:'Self-Taught', student:'Student', working_professional:'Professional', career_changer:'Career Changer' }
const AVAIL_OPTIONS = ['Weekday mornings','Weekday evenings','Weekends','Flexible schedule','Limited availability']
const ROLE_OPTIONS = [
  { key: 'mentors', label: 'Mentors', field: 'open_to_mentor' },
  { key: 'seeking_mentor', label: 'Seeking Mentor', field: 'looking_for_mentor' },
  { key: 'collaborators', label: 'Collaborators', field: 'open_to_collaborate' },
]

function CommunityFilters({ filters, onFilterChange, profiles }) {
  const [showMobile, setShowMobile] = useState(false)

  const parishes = {}
  profiles.forEach((p) => { if (p.parish) parishes[p.parish] = (parishes[p.parish] || 0) + 1 })
  const sortedParishes = Object.entries(parishes).sort((a, b) => b[1] - a[1]).map(([p]) => p)

  const pill = (active) => `px-3 py-1 text-xs font-medium rounded-full border transition-colors cursor-pointer ${
    active ? 'border-green-500 bg-green-500/15 text-green-400' : 'border-gray-700 text-gray-400 hover:border-gray-500'
  }`

  const activeCount = [
    filters.parish !== 'all' ? 1 : 0,
    filters.experience !== 'all' ? 1 : 0,
    filters.availability !== 'all' ? 1 : 0,
    filters.role !== 'all' ? 1 : 0,
    (filters.skills || []).length,
  ].reduce((a, b) => a + b, 0)

  const content = (
    <div className="space-y-4">
      {/* Parish */}
      <div>
        <span className="text-xs text-gray-500 mr-2">Parish:</span>
        <div className="inline-flex flex-wrap gap-1.5 mt-1">
          <button className={pill(filters.parish === 'all')} onClick={() => onFilterChange({ ...filters, parish: 'all' })}>All</button>
          {sortedParishes.slice(0, 8).map((p) => (
            <button key={p} className={pill(filters.parish === p)} onClick={() => onFilterChange({ ...filters, parish: p })}>{p}</button>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div>
        <span className="text-xs text-gray-500 mr-2">Experience:</span>
        <div className="inline-flex flex-wrap gap-1.5 mt-1">
          <button className={pill(filters.experience === 'all')} onClick={() => onFilterChange({ ...filters, experience: 'all' })}>All</button>
          {EXP_OPTIONS.map((e) => (
            <button key={e} className={pill(filters.experience === e)} onClick={() => onFilterChange({ ...filters, experience: e })}>{EXP_LABELS[e]}</button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <span className="text-xs text-gray-500 mr-2">Available:</span>
        <div className="inline-flex flex-wrap gap-1.5 mt-1">
          <button className={pill(filters.availability === 'all')} onClick={() => onFilterChange({ ...filters, availability: 'all' })}>All</button>
          {AVAIL_OPTIONS.map((a) => (
            <button key={a} className={pill(filters.availability === a)} onClick={() => onFilterChange({ ...filters, availability: a })}>{a}</button>
          ))}
        </div>
      </div>

      {/* Role */}
      <div>
        <span className="text-xs text-gray-500 mr-2">Looking for:</span>
        <div className="inline-flex flex-wrap gap-1.5 mt-1">
          <button className={pill(filters.role === 'all')} onClick={() => onFilterChange({ ...filters, role: 'all' })}>All</button>
          {ROLE_OPTIONS.map((r) => (
            <button key={r.key} className={pill(filters.role === r.key)} onClick={() => onFilterChange({ ...filters, role: r.key })}>{r.label}</button>
          ))}
        </div>
      </div>

      {activeCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{activeCount} filter{activeCount !== 1 ? 's' : ''} active</span>
          <button onClick={() => onFilterChange({ parish: 'all', experience: 'all', availability: 'all', role: 'all', skills: [] })}
            className="text-xs text-green-400 hover:text-green-300">Clear all</button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:block">{content}</div>
      {/* Mobile */}
      <div className="sm:hidden">
        <button onClick={() => setShowMobile(!showMobile)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-[#1e293b] border border-gray-700 rounded-lg text-sm text-gray-300">
          Filters {activeCount > 0 && <span className="bg-green-500 text-white text-xs px-1.5 rounded-full">{activeCount}</span>}
          <svg className={`w-4 h-4 transition-transform ${showMobile ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showMobile && <div className="mt-3">{content}</div>}
      </div>
    </>
  )
}

export default CommunityFilters
