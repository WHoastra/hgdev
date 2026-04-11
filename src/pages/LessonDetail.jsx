import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import StatusToggle from '../components/StatusToggle'

function LessonDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [module, setModule] = useState(null)
  const [course, setCourse] = useState(null)
  const [progress, setProgress] = useState(null)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('not_started')
  const [loading, setLoading] = useState(true)
  const [saveMessage, setSaveMessage] = useState(null)
  const [prevLesson, setPrevLesson] = useState(null)
  const [nextLesson, setNextLesson] = useState(null)
  const autoSaveTimer = useRef(null)
  const saveMessageTimer = useRef(null)

  useEffect(() => {
    async function fetchLesson() {
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single()

      if (lessonError) {
        setLoading(false)
        return
      }

      const { data: moduleData } = await supabase
        .from('modules')
        .select('*')
        .eq('id', lessonData.module_id)
        .single()

      let courseData = null
      let allLessonsOrdered = []
      if (moduleData) {
        const { data: c } = await supabase
          .from('courses')
          .select('*')
          .eq('id', moduleData.course_id)
          .single()
        courseData = c

        // Fetch all modules for this course in order
        const { data: allModules } = await supabase
          .from('modules')
          .select('*')
          .eq('course_id', moduleData.course_id)
          .order('sort_order')

        // Fetch all lessons for each module in order
        for (const mod of allModules || []) {
          const { data: modLessons } = await supabase
            .from('lessons')
            .select('id, title, sort_order')
            .eq('module_id', mod.id)
            .order('sort_order')
          if (modLessons) {
            allLessonsOrdered.push(...modLessons)
          }
        }
      }

      // Find prev/next
      const currentIndex = allLessonsOrdered.findIndex((l) => l.id === id)
      setPrevLesson(currentIndex > 0 ? allLessonsOrdered[currentIndex - 1] : null)
      setNextLesson(currentIndex < allLessonsOrdered.length - 1 ? allLessonsOrdered[currentIndex + 1] : null)

      const { data: progressData } = await supabase
        .from('progress')
        .select('*')
        .eq('lesson_id', id)
        .limit(1)

      const progressRecord = progressData && progressData.length > 0 ? progressData[0] : null

      setLesson(lessonData)
      setModule(moduleData)
      setCourse(courseData)
      setProgress(progressRecord)
      setNotes(progressRecord?.notes || '')
      setStatus(progressRecord?.status || 'not_started')
      setLoading(false)
    }

    fetchLesson()

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
      if (saveMessageTimer.current) clearTimeout(saveMessageTimer.current)
    }
  }, [id])

  const showSaveMessage = useCallback((msg) => {
    setSaveMessage(msg)
    if (saveMessageTimer.current) clearTimeout(saveMessageTimer.current)
    saveMessageTimer.current = setTimeout(() => setSaveMessage(null), 2000)
  }, [])

  const upsertProgress = useCallback(async (fields) => {
    if (progress) {
      const { error } = await supabase
        .from('progress')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', progress.id)
      return !error
    } else {
      const { data, error } = await supabase
        .from('progress')
        .insert({ lesson_id: id, status: 'not_started', ...fields })
        .select()
        .single()
      if (error) return false
      setProgress(data)
      return true
    }
  }, [progress, id])

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus)
    const fields = { status: newStatus }
    if (newStatus === 'complete') {
      fields.completed_at = new Date().toISOString()
    } else {
      fields.completed_at = null
    }
    await upsertProgress(fields)
  }

  const handleNotesChange = (e) => {
    const value = e.target.value
    setNotes(value)

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(async () => {
      const ok = await upsertProgress({ notes: value })
      if (ok) showSaveMessage('Auto-saved')
    }, 3000)
  }

  const handleSaveNotes = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    const ok = await upsertProgress({ notes })
    if (ok) showSaveMessage('Saved!')
  }

  const handleCompleteAndNext = async () => {
    if (status !== 'complete') {
      await handleStatusChange('complete')
    }
    if (nextLesson) {
      navigate(`/lesson/${nextLesson.id}`)
    } else if (course) {
      navigate(`/course/${course.id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">Lesson not found.</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="mb-6">
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
          {module && (
            <p className="text-sm text-gray-500 mt-1">Module: {module.title}</p>
          )}
        </div>

        {/* Lesson Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-white">{lesson.title}</h1>
          <StatusToggle status={status} onChange={handleStatusChange} />
        </div>

        {/* Lesson Content */}
        {lesson.content && (
          <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-6 sm:p-8 mb-8">
            <p className="text-gray-300 leading-7 text-base whitespace-pre-wrap">
              {lesson.content}
            </p>
          </div>
        )}

        {/* Notes Section */}
        <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">My Notes</h2>
            {saveMessage && (
              <span className="text-sm text-green-400 animate-pulse">
                {saveMessage}
              </span>
            )}
          </div>

          <textarea
            value={notes}
            onChange={handleNotesChange}
            placeholder="Write your notes and key takeaways here..."
            rows={6}
            className="w-full bg-[#0f172a] text-gray-300 border border-gray-700 rounded-lg p-4
              placeholder-gray-600 resize-y text-sm leading-6
              focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500
              transition-colors"
          />

          <button
            onClick={handleSaveNotes}
            className="mt-4 px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg
              hover:bg-green-500 transition-colors"
          >
            Save Notes
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {prevLesson ? (
            <Link
              to={`/lesson/${prevLesson.id}`}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {prevLesson.title}
            </Link>
          ) : (
            <div />
          )}

          <button
            onClick={handleCompleteAndNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg
              hover:bg-green-500 transition-colors"
          >
            {nextLesson ? 'Complete & Next' : 'Complete Course'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default LessonDetail
