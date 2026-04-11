function TimeProjection({ progressRecords, totalLessons, completedLessons }) {
  const completedWithDates = progressRecords
    .filter((p) => p.status === 'complete' && p.completed_at)
    .sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at))

  if (completedLessons === 0) {
    return (
      <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-6">
        <h3 className="text-white font-semibold mb-2">Projected Completion</h3>
        <p className="text-gray-500 text-sm">Complete your first lesson to see projections.</p>
      </div>
    )
  }

  if (completedLessons >= totalLessons) {
    return (
      <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-6">
        <h3 className="text-white font-semibold mb-2">Projected Completion</h3>
        <p className="text-green-400 text-lg font-medium">All complete! You did it! 🎉</p>
        {completedWithDates.length > 0 && (
          <p className="text-gray-500 text-sm mt-1">
            Finished on {new Date(completedWithDates[completedWithDates.length - 1].completed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>
    )
  }

  if (completedWithDates.length < 3) {
    return (
      <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-6">
        <h3 className="text-white font-semibold mb-2">Projected Completion</h3>
        <p className="text-gray-500 text-sm">Complete a few more lessons for accurate projections.</p>
        <p className="text-gray-600 text-xs mt-1">{completedLessons} of {totalLessons} complete so far</p>
      </div>
    )
  }

  // Calculate pace
  const firstDate = new Date(completedWithDates[0].completed_at)
  const lastDate = new Date(completedWithDates[completedWithDates.length - 1].completed_at)
  const daysBetween = Math.max(1, (lastDate - firstDate) / (1000 * 60 * 60 * 24))
  const lessonsPerDay = completedWithDates.length / daysBetween
  const lessonsPerWeek = Math.round(lessonsPerDay * 7 * 10) / 10

  const remaining = totalLessons - completedLessons
  const daysRemaining = Math.ceil(remaining / lessonsPerDay)
  const weeksRemaining = Math.floor(daysRemaining / 7)
  const daysRemainder = daysRemaining % 7

  const estimatedDate = new Date()
  estimatedDate.setDate(estimatedDate.getDate() + daysRemaining)
  const dateStr = estimatedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  let motivation = ''
  if (lessonsPerWeek > 5) motivation = "You're flying! At this rate, you'll be done in no time."
  else if (lessonsPerWeek >= 2) motivation = 'Steady progress. Consistency beats speed every time.'
  else if (lessonsPerWeek >= 1) motivation = "Every lesson counts. You're still lapping everyone on the couch."
  else motivation = "Life gets busy. Even one lesson a week gets you there."

  const timeStr = weeksRemaining > 0
    ? `${weeksRemaining} week${weeksRemaining !== 1 ? 's' : ''}${daysRemainder > 0 ? `, ${daysRemainder} day${daysRemainder !== 1 ? 's' : ''}` : ''}`
    : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`

  return (
    <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-6">
      <h3 className="text-white font-semibold mb-5">Projected Completion</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div>
          <p className="text-xs text-gray-500 mb-1">Your pace</p>
          <p className="text-white font-medium">{lessonsPerWeek} lessons/week</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Time remaining</p>
          <p className="text-white font-medium">{timeStr}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Estimated finish</p>
          <p className="text-white font-medium">{dateStr}</p>
        </div>
      </div>
      <p className="text-sm text-gray-400">{motivation}</p>
    </div>
  )
}

export default TimeProjection
