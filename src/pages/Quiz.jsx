import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import QuizQuestion from '../components/QuizQuestion'
import QuizResults from '../components/QuizResults'

function shuffleOptions(question) {
  const indices = [0, 1, 2, 3]
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]]
  }
  const newOptions = indices.map((i) => question.options[i])
  const newCorrectIndex = indices.indexOf(question.correct_index)
  return { ...question, options: newOptions, correct_index: newCorrectIndex, _originalOptions: question.options }
}

function Quiz() {
  const { moduleId } = useParams()
  const [mod, setMod] = useState(null)
  const [course, setCourse] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [showNext, setShowNext] = useState(false)

  const initQuiz = useCallback(async () => {
    setLoading(true)
    setCurrentIndex(0)
    setAnswers([])
    setShowResults(false)
    setShowNext(false)

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

    const { data: questionsData } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('module_id', moduleId)
      .order('sort_order')

    const shuffled = (questionsData || []).map(shuffleOptions)
    setQuestions(shuffled)
    setLoading(false)
  }, [moduleId])

  useEffect(() => {
    initQuiz()
  }, [initQuiz])

  const handleAnswer = async (answer) => {
    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)
    setShowNext(true)
  }

  const handleNext = async () => {
    setShowNext(false)
    if (currentIndex + 1 >= questions.length) {
      // Calculate results and save attempt
      const score = answers.filter((a) => a.is_correct).length
      const total = questions.length
      const percentage = Math.round((score / total) * 100)

      await supabase.from('quiz_attempts').insert({
        module_id: moduleId,
        score,
        total,
        percentage,
        answers,
      })

      setShowResults(true)
    } else {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleRetake = () => {
    const reshuffled = questions.map((q) => shuffleOptions({ ...q, options: q._originalOptions || q.options }))
    setQuestions(reshuffled)
    setCurrentIndex(0)
    setAnswers([])
    setShowResults(false)
    setShowNext(false)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center animate-fade-in">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-6">No quiz available for this module yet.</p>
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

  const score = answers.filter((a) => a.is_correct).length
  const percentage = Math.round((score / questions.length) * 100)

  return (
    <div className="animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
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
          {mod && !showResults && (
            <p className="text-sm text-gray-500 mt-1">Quiz: {mod.title}</p>
          )}
        </div>

        {showResults ? (
          <QuizResults
            score={score}
            total={questions.length}
            percentage={percentage}
            answers={answers}
            questions={questions}
            courseId={course?.id}
            onRetake={handleRetake}
          />
        ) : (
          <>
            <QuizQuestion
              key={currentIndex}
              question={questions[currentIndex]}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              onAnswer={handleAnswer}
            />
            {showNext && (
              <div className="max-w-2xl mx-auto mt-6 animate-fade-in">
                <button
                  onClick={handleNext}
                  className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg
                    hover:bg-green-500 transition-colors inline-flex items-center gap-2"
                >
                  {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Quiz
