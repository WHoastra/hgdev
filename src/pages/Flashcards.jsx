import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useUserId } from '../lib/useUserId'
import FlashcardDeck from '../components/FlashcardDeck'
import { useCoach } from '../lib/CoachContext'

function Flashcards() {
  const { moduleId } = useParams()
  const { userId, isLoaded } = useUserId()
  const { setCoachContext } = useCoach()
  const [mod, setMod] = useState(null)
  const [course, setCourse] = useState(null)
  const [flashcards, setFlashcards] = useState([])
  const [progressData, setProgressData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded || !userId) return

    async function fetchData() {
      const { data: moduleData } = await supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .single()

      if (moduleData) {
        const { data: courseData } = await supabase
          .from('courses')
          .select('*')
          .eq('id', moduleData.course_id)
          .single()
        setCourse(courseData)
      }
      setMod(moduleData)

      const { data: cards } = await supabase
        .from('flashcards')
        .select('*')
        .eq('module_id', moduleId)
        .order('sort_order')

      setFlashcards(cards || [])

      if (cards && cards.length > 0) {
        const cardIds = cards.map((c) => c.id)
        const { data: progress } = await supabase
          .from('flashcard_progress')
          .select('*')
          .in('flashcard_id', cardIds)
          .eq('user_id', userId)
        setProgressData(progress || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [moduleId, userId, isLoaded])

  useEffect(() => {
    if (mod && course) {
      setCoachContext('flashcard', moduleId, { moduleTitle: mod.title, courseTitle: course.title, currentQuestion: flashcards[0]?.question || '' })
    }
  }, [mod, course, flashcards])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading flashcards...</p>
        </div>
      </div>
    )
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center animate-fade-in">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-6">No flashcards available for this module yet.</p>
          {course && (
            <Link
              to={`/course/${course.id}`}
              className="px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-500 transition-colors"
            >
              Back to Course
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          {course && (
            <Link
              to={`/course/${course.id}`}
              className="inline-flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to {course.title}
            </Link>
          )}
          {mod && (
            <p className="text-sm text-gray-500 mt-1">Flashcards: {mod.title}</p>
          )}
        </div>

        <FlashcardDeck
          flashcards={flashcards}
          progressData={progressData}
          moduleId={moduleId}
          courseId={course?.id}
          userId={userId}
        />
      </div>

    </div>
  )
}

export default Flashcards
