import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ProgressBar from '../components/ProgressBar'

function StatusIcon({ status }) {
  if (status === 'complete') {
    return (
      <svg className="w-5 h-5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  }
  if (status === 'in_progress') {
    return (
      <svg className="w-5 h-5 text-yellow-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 010 18" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg className="w-5 h-5 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

const difficultyColors = {
  beginner: 'bg-green-900 text-green-300',
  intermediate: 'bg-yellow-900 text-yellow-300',
  advanced: 'bg-red-900 text-red-300',
}

function scoreColor(pct) {
  if (pct >= 80) return 'text-green-400'
  if (pct >= 60) return 'text-yellow-400'
  return 'text-red-400'
}

function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [expanded, setExpanded] = useState({})
  const [loading, setLoading] = useState(true)
  const [overallProgress, setOverallProgress] = useState({ completed: 0, total: 0 })

  useEffect(() => {
    async function fetchCourse() {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single()

      if (courseError) {
        setLoading(false)
        return
      }

      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', id)
        .order('sort_order')

      const modulesWithLessons = []
      let totalLessons = 0
      let completedLessons = 0
      const expandState = {}

      for (const mod of modulesData || []) {
        const { data: lessons } = await supabase
          .from('lessons')
          .select('*')
          .eq('module_id', mod.id)
          .order('sort_order')

        const lessonsWithProgress = []

        for (const lesson of lessons || []) {
          const { data: progressData } = await supabase
            .from('progress')
            .select('*')
            .eq('lesson_id', lesson.id)
            .limit(1)

          const progress = progressData && progressData.length > 0
            ? progressData[0]
            : { status: 'not_started' }

          lessonsWithProgress.push({ ...lesson, progress })
          totalLessons++
          if (progress.status === 'complete') completedLessons++
        }

        // Check if quiz exists for this module
        const { count: quizCount } = await supabase
          .from('quiz_questions')
          .select('id', { count: 'exact', head: true })
          .eq('module_id', mod.id)

        // Get best quiz attempt
        const { data: attempts } = await supabase
          .from('quiz_attempts')
          .select('percentage')
          .eq('module_id', mod.id)
          .order('percentage', { ascending: false })
          .limit(1)

        const bestScore = attempts && attempts.length > 0 ? attempts[0].percentage : null

        // Check if flashcards exist for this module
        const { count: flashcardCount } = await supabase
          .from('flashcards')
          .select('id', { count: 'exact', head: true })
          .eq('module_id', mod.id)

        // Get best flashcard session
        const { data: fcSessions } = await supabase
          .from('flashcard_sessions')
          .select('session_percentage')
          .eq('module_id', mod.id)
          .order('session_percentage', { ascending: false })
          .limit(1)

        const bestFlashcardScore = fcSessions && fcSessions.length > 0 ? fcSessions[0].session_percentage : null

        modulesWithLessons.push({
          ...mod,
          lessons: lessonsWithProgress,
          hasQuiz: (quizCount || 0) > 0,
          bestScore,
          hasFlashcards: (flashcardCount || 0) > 0,
          bestFlashcardScore,
        })
        expandState[mod.id] = true
      }

      setCourse(courseData)
      setModules(modulesWithLessons)
      setExpanded(expandState)
      setOverallProgress({ completed: completedLessons, total: totalLessons })
      setLoading(false)
    }

    fetchCourse()
  }, [id])

  const toggleModule = (moduleId) => {
    setExpanded((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }))
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">Course not found.</p>
      </div>
    )
  }

  const percentage = overallProgress.total > 0
    ? (overallProgress.completed / overallProgress.total) * 100
    : 0

  return (
    <div className="animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/courses"
          className="inline-flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Courses
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            {course.category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
                {course.category}
              </span>
            )}
            {course.difficulty && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[course.difficulty] || 'bg-gray-700 text-gray-300'}`}>
                {course.difficulty}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
          {course.description && (
            <p className="text-gray-400">{course.description}</p>
          )}

          <div className="mt-6">
            <ProgressBar percentage={percentage} />
            <p className="text-xs text-gray-500 mt-2">
              {overallProgress.completed} of {overallProgress.total} lessons complete
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {modules.map((mod) => (
            <div key={mod.id} className="bg-[#1e293b] rounded-lg border border-gray-700 overflow-hidden">
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-700/30 transition-colors"
              >
                <div>
                  <h3 className="text-white font-medium">{mod.title}</h3>
                  {mod.description && (
                    <p className="text-sm text-gray-400 mt-0.5">{mod.description}</p>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                    expanded[mod.id] ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={`transition-all duration-200 overflow-hidden ${
                  expanded[mod.id] ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="border-t border-gray-700">
                  {mod.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => navigate(`/lesson/${lesson.id}`)}
                      className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-gray-700/20 transition-colors border-t border-gray-700/50 first:border-t-0"
                    >
                      <StatusIcon status={lesson.progress.status} />
                      <span className="text-sm text-gray-300">{lesson.title}</span>
                    </button>
                  ))}

                  {(mod.hasQuiz || mod.hasFlashcards) && (
                    <div className="border-t border-gray-700 px-5 py-3 flex flex-wrap items-center gap-3">
                      {mod.hasQuiz && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/quiz/${mod.id}`)}
                            className="inline-flex items-center gap-2 text-sm font-medium text-green-400 border border-green-500/50 rounded-lg px-4 py-2
                              hover:bg-green-500/10 transition-colors"
                          >
                            Take Quiz
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          {mod.bestScore !== null && (
                            <span className={`text-xs font-medium ${scoreColor(mod.bestScore)}`}>
                              Best: {mod.bestScore}%
                            </span>
                          )}
                        </div>
                      )}
                      {mod.hasFlashcards && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/flashcards/${mod.id}`)}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-yellow-400 border border-yellow-500/50 rounded-lg px-4 py-2
                              hover:bg-yellow-500/10 transition-colors"
                          >
                            Flashcards ⚡
                          </button>
                          {mod.bestFlashcardScore !== null && (
                            <span className={`text-xs font-medium ${scoreColor(mod.bestFlashcardScore)}`}>
                              Best: {mod.bestFlashcardScore}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CourseDetail
