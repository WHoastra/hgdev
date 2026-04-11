import { useState } from 'react'
import { Link } from 'react-router-dom'

const letters = ['A', 'B', 'C', 'D']

function getMessage(pct) {
  if (pct === 100) return { text: 'Perfect score! You\'ve mastered this module. 🏆', color: 'text-green-400' }
  if (pct >= 80) return { text: 'Great job! You really know this material. 🎯', color: 'text-green-400' }
  if (pct >= 60) return { text: 'Good effort! Review the lessons you missed and try again. 💪', color: 'text-yellow-400' }
  return { text: 'Keep learning! Review the module lessons and give it another shot. 📚', color: 'text-red-400' }
}

function getScoreColor(pct) {
  if (pct >= 80) return 'text-green-500'
  if (pct >= 60) return 'text-yellow-500'
  return 'text-red-500'
}

function QuizResults({ score, total, percentage, answers, questions, courseId, onRetake }) {
  const [reviewOpen, setReviewOpen] = useState(false)
  const message = getMessage(percentage)
  const scoreColor = getScoreColor(percentage)

  const circumference = 2 * Math.PI * 54
  const strokeOffset = circumference - (percentage / 100) * circumference

  return (
    <div className="max-w-2xl mx-auto text-center animate-fade-in">
      {/* Score ring */}
      <div className="relative inline-block mb-6">
        <svg width="140" height="140" className="-rotate-90">
          <circle cx="70" cy="70" r="54" fill="none" stroke="#1e293b" strokeWidth="10" />
          <circle
            cx="70" cy="70" r="54" fill="none"
            stroke={percentage >= 80 ? '#22c55e' : percentage >= 60 ? '#eab308' : '#ef4444'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-bold ${scoreColor}`}>{percentage}%</span>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">
        {score} out of {total}
      </h2>
      <p className={`text-lg mb-10 ${message.color}`}>{message.text}</p>

      {/* Review toggle */}
      <button
        onClick={() => setReviewOpen(!reviewOpen)}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors mb-6"
      >
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${reviewOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        {reviewOpen ? 'Hide Answers' : 'Review Answers'}
      </button>

      {/* Review section */}
      <div className={`transition-all duration-300 overflow-hidden ${reviewOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="space-y-4 text-left mb-10">
          {questions.map((q, i) => {
            const answer = answers[i]
            const isCorrect = answer?.is_correct
            return (
              <div key={q.id} className="bg-[#1e293b] border border-gray-700 rounded-lg p-5">
                <div className="flex items-start gap-3 mb-3">
                  <span className={`shrink-0 mt-0.5 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                    {isCorrect ? '✓' : '✗'}
                  </span>
                  <p className="text-sm text-white font-medium">{q.question}</p>
                </div>
                <div className="ml-7 space-y-1 text-sm">
                  <p className="text-gray-400">
                    Your answer: <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                      {letters[answer?.selected_index]} — {q.options[answer?.selected_index]}
                    </span>
                  </p>
                  {!isCorrect && (
                    <p className="text-gray-400">
                      Correct: <span className="text-green-400">
                        {letters[q.correct_index]} — {q.options[q.correct_index]}
                      </span>
                    </p>
                  )}
                  {q.explanation && (
                    <p className="text-gray-500 mt-2">{q.explanation}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
        <button
          onClick={onRetake}
          className="px-6 py-2.5 border border-gray-600 text-gray-300 text-sm font-medium rounded-lg
            hover:border-gray-400 hover:text-white transition-colors"
        >
          Retake Quiz
        </button>
        <Link
          to={`/course/${courseId}`}
          className="px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg
            hover:bg-green-500 transition-colors"
        >
          Back to Course
        </Link>
      </div>
    </div>
  )
}

export default QuizResults
