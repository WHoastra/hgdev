import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import StatCard from '../components/StatCard'
import ProgressBar from '../components/ProgressBar'
import CompletionRing from '../components/CompletionRing'
import TimeProjection from '../components/TimeProjection'

function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now - date) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

function getMotivation(rate) {
  if (rate === 0) return 'Every expert was once a beginner. Let\'s get started! 🌱'
  if (rate <= 25) return 'Great start! You\'re building momentum. 🚀'
  if (rate <= 50) return 'Almost halfway there. Keep pushing! 💪'
  if (rate <= 75) return 'More than halfway! You\'re crushing it. 🔥'
  if (rate < 100) return 'The finish line is in sight. Don\'t stop now! ⭐'
  return 'You did it! Course complete! 🎉🏆'
}

const statusBadge = {
  not_started: 'bg-gray-700 text-gray-300',
  in_progress: 'bg-yellow-900 text-yellow-300',
  complete: 'bg-green-900 text-green-300',
}
const statusLabel = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  complete: 'Complete',
}

const categoryColors = {
  'Prompt Engineering': 'bg-green-900 text-green-300',
  'Development': 'bg-blue-900 text-blue-300',
  'AI Safety': 'bg-purple-900 text-purple-300',
  'Use Cases': 'bg-amber-900 text-amber-300',
}

function Progress() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [rawData, setRawData] = useState(null)

  useEffect(() => {
    async function fetchAll() {
      const [courses, modules, lessons, progress] = await Promise.all([
        supabase.from('courses').select('*').order('created_at'),
        supabase.from('modules').select('*').order('sort_order'),
        supabase.from('lessons').select('*').order('sort_order'),
        supabase.from('progress').select('*'),
      ])
      setRawData({
        courses: courses.data || [],
        modules: modules.data || [],
        lessons: lessons.data || [],
        progress: progress.data || [],
      })
      setLoading(false)
    }
    fetchAll()
  }, [])

  const computed = useMemo(() => {
    if (!rawData) return null
    const { courses, modules, lessons, progress } = rawData

    const progressByLesson = {}
    for (const p of progress) progressByLesson[p.lesson_id] = p

    const totalLessons = lessons.length
    const completedLessons = progress.filter((p) => p.status === 'complete').length
    const inProgressLessons = progress.filter((p) => p.status === 'in_progress').length
    const notStartedLessons = totalLessons - completedLessons - inProgressLessons
    const rate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    // Course breakdown
    const courseBreakdown = courses.map((course) => {
      const courseModules = modules.filter((m) => m.course_id === course.id)
      const courseLessons = lessons.filter((l) => courseModules.some((m) => m.id === l.module_id))
      const completed = courseLessons.filter((l) => progressByLesson[l.id]?.status === 'complete').length
      const inProg = courseLessons.filter((l) => progressByLesson[l.id]?.status === 'in_progress').length
      const pct = courseLessons.length > 0 ? Math.round((completed / courseLessons.length) * 100) : 0

      const moduleBreakdown = courseModules.map((mod) => {
        const modLessons = lessons.filter((l) => l.module_id === mod.id)
        const modCompleted = modLessons.filter((l) => progressByLesson[l.id]?.status === 'complete').length
        return { ...mod, totalLessons: modLessons.length, completedLessons: modCompleted, percentage: modLessons.length > 0 ? (modCompleted / modLessons.length) * 100 : 0 }
      })

      return { ...course, totalLessons: courseLessons.length, completedLessons: completed, inProgress: inProg, percentage: pct, modules: moduleBreakdown }
    }).sort((a, b) => b.percentage - a.percentage)

    // Streak calculation
    const activeDates = new Set()
    for (const p of progress) {
      if (p.completed_at) activeDates.add(new Date(p.completed_at).toDateString())
      if (p.updated_at) activeDates.add(new Date(p.updated_at).toDateString())
    }

    const today = new Date()
    let currentStreak = 0
    const check = new Date(today)
    while (true) {
      if (activeDates.has(check.toDateString())) {
        currentStreak++
        check.setDate(check.getDate() - 1)
      } else if (currentStreak === 0) {
        // Check if yesterday had activity (user may not have done anything today yet)
        check.setDate(check.getDate() - 1)
        if (activeDates.has(check.toDateString())) {
          currentStreak++
          check.setDate(check.getDate() - 1)
        } else break
      } else break
    }

    // Last 14 days for streak grid
    const last14 = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      last14.push({ date: d, active: activeDates.has(d.toDateString()), isToday: i === 0 })
    }

    // Longest streak
    const sortedDates = [...activeDates].map((d) => new Date(d).getTime()).sort()
    let longestStreak = 0
    let tempStreak = 1
    for (let i = 1; i < sortedDates.length; i++) {
      const diff = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24)
      if (diff <= 1) { tempStreak++; longestStreak = Math.max(longestStreak, tempStreak) }
      else tempStreak = 1
    }
    if (sortedDates.length === 1) longestStreak = 1
    longestStreak = Math.max(longestStreak, currentStreak)

    // Recent activity
    const recentActivity = [...progress]
      .filter((p) => p.updated_at)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 5)
      .map((p) => ({ ...p, lessonTitle: lessons.find((l) => l.id === p.lesson_id)?.title || 'Unknown' }))

    return {
      totalLessons, completedLessons, inProgressLessons, notStartedLessons, rate,
      courses: courses.length, courseBreakdown, progress, recentActivity,
      currentStreak, longestStreak, last14,
    }
  }, [rawData])

  if (loading || !computed) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading progress...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Your Progress</h1>
          <p className="text-gray-400 mt-1">See how far you've come</p>
        </div>

        {/* Motivation */}
        <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-5 mb-8 text-center">
          <p className="text-lg text-gray-200">{getMotivation(computed.rate)}</p>
        </div>

        {/* Overall Progress: Ring + Breakdown */}
        <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <CompletionRing percentage={computed.rate} size={180} label="Overall" />
            <div className="flex-1 w-full">
              <h3 className="text-lg font-semibold text-white mb-1">Total Progress</h3>
              <p className="text-sm text-gray-400 mb-5">
                {computed.completedLessons} of {computed.totalLessons} lessons complete across {computed.courses} courses
              </p>
              {/* Stacked bar */}
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden flex mb-3">
                {computed.completedLessons > 0 && (
                  <div className="bg-green-500 h-full transition-all duration-700" style={{ width: `${(computed.completedLessons / computed.totalLessons) * 100}%` }} />
                )}
                {computed.inProgressLessons > 0 && (
                  <div className="bg-yellow-500 h-full transition-all duration-700" style={{ width: `${(computed.inProgressLessons / computed.totalLessons) * 100}%` }} />
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="text-green-400">✅ {computed.completedLessons} Complete</span>
                <span className="text-yellow-400">🔄 {computed.inProgressLessons} In Progress</span>
                <span className="text-gray-400">○ {computed.notStartedLessons} Not Started</span>
              </div>
            </div>
          </div>
        </div>

        {/* Time Projection */}
        <div className="mb-8">
          <TimeProjection
            progressRecords={computed.progress}
            totalLessons={computed.totalLessons}
            completedLessons={computed.completedLessons}
          />
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon="📚" label="Total Courses" value={computed.courses} color="#3b82f6" />
          <StatCard icon="🎯" label="Total Lessons" value={computed.totalLessons} color="#8b5cf6" />
          <StatCard icon="✅" label="Completed" value={computed.completedLessons} color="#22c55e" />
          <StatCard icon="📊" label="Completion Rate" value={`${computed.rate}%`} color="#eab308" />
        </div>

        {/* Learning Streak */}
        <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-6 mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">Your Streak</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-400">🔥 {computed.currentStreak}</p>
              <p className="text-xs text-gray-500 mt-1">day streak</p>
            </div>
            <div className="text-center ml-4">
              <p className="text-lg font-bold text-gray-400">{computed.longestStreak}</p>
              <p className="text-xs text-gray-500">longest</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {computed.last14.map((day, i) => (
              <div
                key={i}
                title={day.date.toLocaleDateString()}
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-sm transition-colors ${
                  day.active ? 'bg-green-500' : 'bg-gray-800'
                } ${day.isToday ? 'ring-1 ring-white/30' : ''}`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">Last 14 days</p>
        </div>

        {/* Course Breakdown Table */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">Course Breakdown</h2>
          <div className="bg-[#1e293b] rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-500 font-medium px-5 py-3">Course</th>
                    <th className="text-left text-gray-500 font-medium px-3 py-3 hidden sm:table-cell">Category</th>
                    <th className="text-left text-gray-500 font-medium px-3 py-3">Progress</th>
                    <th className="text-right text-gray-500 font-medium px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {computed.courseBreakdown.map((course) => {
                    const statusText = course.percentage === 0 ? 'Not started' : course.percentage >= 100 ? 'Complete' : 'In progress'
                    const statusColor = course.percentage === 0 ? 'text-gray-500' : course.percentage >= 100 ? 'text-green-400' : 'text-yellow-400'
                    return (
                      <tr
                        key={course.id}
                        onClick={() => navigate(`/course/${course.id}`)}
                        className="border-b border-gray-700/50 last:border-b-0 hover:bg-gray-700/20 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-3 text-white font-medium">{course.title}</td>
                        <td className="px-3 py-3 hidden sm:table-cell">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[course.category] || 'bg-gray-700 text-gray-300'}`}>
                            {course.category}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-24 sm:w-36 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{ width: `${course.percentage}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{course.completedLessons}/{course.totalLessons}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className={`text-xs font-medium ${statusColor}`}>
                            {course.percentage >= 100 && '✓ '}{statusText}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          {computed.recentActivity.length === 0 ? (
            <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-8 text-center">
              <p className="text-gray-500">No activity yet. Start a lesson to begin tracking!</p>
            </div>
          ) : (
            <div className="bg-[#1e293b] rounded-lg border border-gray-700 divide-y divide-gray-700">
              {computed.recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {item.notes && <span className="shrink-0">📝</span>}
                    <span className="text-sm text-gray-300 truncate">{item.lessonTitle}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[item.status]}`}>
                      {statusLabel[item.status]}
                    </span>
                    <span className="text-xs text-gray-500 w-16 text-right">
                      {timeAgo(item.updated_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Progress
