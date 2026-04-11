import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import StatCard from '../components/StatCard'
import ProgressBar from '../components/ProgressBar'

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

function Progress() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ courses: 0, lessons: 0, completed: 0, rate: 0 })
  const [courseBreakdown, setCourseBreakdown] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    async function fetchAll() {
      const { data: courses } = await supabase.from('courses').select('*').order('created_at')
      const { data: allModules } = await supabase.from('modules').select('*').order('sort_order')
      const { data: allLessons } = await supabase.from('lessons').select('*').order('sort_order')
      const { data: allProgress } = await supabase.from('progress').select('*')

      const courseList = courses || []
      const moduleList = allModules || []
      const lessonList = allLessons || []
      const progressList = allProgress || []

      const progressByLesson = {}
      for (const p of progressList) {
        progressByLesson[p.lesson_id] = p
      }

      const totalLessons = lessonList.length
      const completedLessons = progressList.filter((p) => p.status === 'complete').length
      const rate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

      setStats({
        courses: courseList.length,
        lessons: totalLessons,
        completed: completedLessons,
        rate,
      })

      const breakdown = courseList.map((course) => {
        const courseModules = moduleList.filter((m) => m.course_id === course.id)
        const moduleBreakdown = courseModules.map((mod) => {
          const modLessons = lessonList.filter((l) => l.module_id === mod.id)
          const modCompleted = modLessons.filter(
            (l) => progressByLesson[l.id]?.status === 'complete'
          ).length
          return {
            ...mod,
            totalLessons: modLessons.length,
            completedLessons: modCompleted,
            percentage: modLessons.length > 0 ? (modCompleted / modLessons.length) * 100 : 0,
          }
        })

        const courseLessons = lessonList.filter((l) =>
          courseModules.some((m) => m.id === l.module_id)
        )
        const courseCompleted = courseLessons.filter(
          (l) => progressByLesson[l.id]?.status === 'complete'
        ).length

        return {
          ...course,
          modules: moduleBreakdown,
          totalLessons: courseLessons.length,
          completedLessons: courseCompleted,
          percentage: courseLessons.length > 0 ? (courseCompleted / courseLessons.length) * 100 : 0,
        }
      })

      setCourseBreakdown(breakdown)

      const sortedProgress = [...progressList]
        .filter((p) => p.updated_at)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 5)

      const activityItems = sortedProgress.map((p) => {
        const lesson = lessonList.find((l) => l.id === p.lesson_id)
        return { ...p, lessonTitle: lesson?.title || 'Unknown Lesson' }
      })

      setRecentActivity(activityItems)
      setLoading(false)
    }

    fetchAll()
  }, [])

  if (loading) {
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

        <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-5 mb-8 text-center">
          <p className="text-lg text-gray-200">{getMotivation(stats.rate)}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon="📚" label="Total Courses" value={stats.courses} color="#3b82f6" />
          <StatCard icon="🎯" label="Total Lessons" value={stats.lessons} color="#8b5cf6" />
          <StatCard icon="✅" label="Completed" value={stats.completed} color="#22c55e" />
          <StatCard icon="📊" label="Completion Rate" value={`${stats.rate}%`} color="#eab308" />
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">Course Breakdown</h2>
          <div className="space-y-4">
            {courseBreakdown.map((course) => (
              <CourseProgressCard key={course.id} course={course} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-8 text-center">
              <p className="text-gray-500">No activity yet. Start a lesson to begin tracking!</p>
            </div>
          ) : (
            <div className="bg-[#1e293b] rounded-lg border border-gray-700 divide-y divide-gray-700">
              {recentActivity.map((item) => (
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

function CourseProgressCard({ course }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-[#1e293b] rounded-lg border border-gray-700 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 text-left hover:bg-gray-700/30 transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-medium">{course.title}</h3>
          <svg
            className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <ProgressBar percentage={course.percentage} />
        <p className="text-xs text-gray-500 mt-2">
          {course.completedLessons} of {course.totalLessons} lessons complete
        </p>
      </button>

      <div
        className={`transition-all duration-200 overflow-hidden ${
          expanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-gray-700 px-5 py-3 space-y-3">
          {course.modules.map((mod) => (
            <div key={mod.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300">{mod.title}</span>
                <span className="text-xs text-gray-500">
                  {mod.completedLessons}/{mod.totalLessons}
                </span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${mod.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Progress
