import { useState } from 'react'
import TextToSpeech from './TextToSpeech'

const letters = ['A', 'B', 'C', 'D']

function QuizQuestion({ question, questionNumber, totalQuestions, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const isCorrect = submitted && selected === question.correct_index
  const isWrong = submitted && selected !== question.correct_index

  const handleSubmit = () => {
    if (selected === null) return
    setSubmitted(true)
    onAnswer({
      question_id: question.id,
      selected_index: selected,
      correct_index: question.correct_index,
      is_correct: selected === question.correct_index,
    })
  }

  const optionClass = (i) => {
    const base = 'w-full flex items-center gap-4 px-4 py-3.5 rounded-lg border text-left transition-all duration-200 text-sm'

    if (submitted) {
      if (i === question.correct_index) return `${base} border-green-500 bg-green-500/10 text-white`
      if (i === selected) return `${base} border-red-500 bg-red-500/10 text-white`
      return `${base} border-gray-700 bg-[#1e293b] text-gray-500`
    }

    if (i === selected) return `${base} border-green-500 bg-green-500/5 text-white`
    return `${base} border-gray-700 bg-[#1e293b] text-gray-300 hover:border-green-500/50 hover:bg-gray-700/30 cursor-pointer`
  }

  const letterClass = (i) => {
    const base = 'w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0 transition-colors duration-200'
    if (submitted && i === question.correct_index) return `${base} bg-green-500 text-white`
    if (submitted && i === selected) return `${base} bg-red-500 text-white`
    if (!submitted && i === selected) return `${base} bg-green-500 text-white`
    return `${base} bg-gray-700 text-gray-400`
  }

  const progress = ((questionNumber) / totalQuestions) * 100

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">Question {questionNumber} of {totalQuestions}</span>
          <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
        </div>
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="flex items-start gap-3 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug flex-1">
          {question.question}
        </h2>
        <TextToSpeech text={question.question} size="small" />
      </div>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => !submitted && setSelected(i)}
            disabled={submitted}
            className={optionClass(i)}
          >
            <span className={letterClass(i)}>{letters[i]}</span>
            <span>{opt}</span>
          </button>
        ))}
      </div>

      {/* Explanation (after submit) */}
      {submitted && question.explanation && (
        <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-5 mb-8 animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-lg shrink-0">{isCorrect ? '✅' : '💡'}</span>
            <p className="text-sm text-gray-300 leading-relaxed flex-1">{question.explanation}</p>
            <TextToSpeech text={question.explanation} size="small" />
          </div>
        </div>
      )}

      {/* Actions */}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg
            hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Submit Answer
        </button>
      ) : null}
    </div>
  )
}

export default QuizQuestion
