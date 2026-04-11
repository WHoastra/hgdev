function CommunityStats({ profiles }) {
  const totalMembers = profiles.length
  const parishes = new Set(profiles.map((p) => p.parish).filter(Boolean)).size
  const allSkills = new Set()
  profiles.forEach((p) => (p.skills || []).forEach((s) => allSkills.add(s.name)))
  const mentors = profiles.filter((p) => p.open_to_mentor).length

  const stats = [
    { value: totalMembers, label: 'Members', color: '#22c55e' },
    { value: parishes, label: 'Parishes', color: '#3b82f6' },
    { value: allSkills.size, label: 'Skills Listed', color: '#8b5cf6' },
    { value: mentors, label: 'Mentors', color: '#eab308' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-[#1e293b] rounded-lg border border-gray-700 p-4" style={{ borderLeftWidth: '3px', borderLeftColor: s.color }}>
          <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
          <p className="text-xs text-gray-500">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

export default CommunityStats
