import { useState, useEffect } from 'react'
import TextToSpeech from './TextToSpeech'

function DifficultyDots({ level }) {
  const colors = ['bg-green-500', 'bg-yellow-500', 'bg-red-500']
  return (
    <div className="flex gap-1">
      {Array.from({ length: level }, (_, i) => (
        <div key={i} className={`w-2 h-2 rounded-full ${colors[level - 1]}`} />
      ))}
    </div>
  )
}

function Flashcard({ flashcard, onResult, autoRead }) {
  const [flipped, setFlipped] = useState(false)

  // Cancel speech on card change
  useEffect(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }, [flashcard.id])

  // Auto-read question on new card
  useEffect(() => {
    if (autoRead && 'speechSynthesis' in window) {
      const utt = new SpeechSynthesisUtterance(flashcard.question)
      try {
        utt.rate = parseFloat(localStorage.getItem('tts-speed')) || 1
      } catch {}
      window.speechSynthesis.speak(utt)
    }
  }, [flashcard.id, autoRead])

  const handleFlip = () => {
    if (!flipped) {
      setFlipped(true)
      if (autoRead && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        setTimeout(() => {
          const utt = new SpeechSynthesisUtterance(flashcard.answer)
          try { utt.rate = parseFloat(localStorage.getItem('tts-speed')) || 1 } catch {}
          window.speechSynthesis.speak(utt)
        }, 600)
      }
    }
  }

  const handleResult = (correct) => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    onResult({ cardId: flashcard.id, correct })
    setFlipped(false)
  }

  return (
    <div
      className="flashcard-container w-full max-w-[500px] mx-auto"
      style={{ perspective: '1200px', height: '320px' }}
    >
      <div
        className={`flashcard-inner relative w-full h-full transition-transform duration-500 ${flipped ? 'flashcard-flipped' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 bg-[#1e293b] border border-gray-700 rounded-2xl p-6 flex flex-col cursor-pointer hover:border-green-500/30 transition-colors"
          style={{ backfaceVisibility: 'hidden' }}
          onClick={handleFlip}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Question</span>
              <div onClick={(e) => e.stopPropagation()}>
                <TextToSpeech text={flashcard.question} size="small" />
              </div>
            </div>
            <DifficultyDots level={flashcard.difficulty} />
          </div>
          <div className="flex-1 flex items-center justify-center px-4">
            <p className="text-lg sm:text-xl text-white text-center leading-relaxed">
              {flashcard.question}
            </p>
          </div>
          <p className="text-xs text-gray-600 text-center">Click to reveal answer</p>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 bg-[#1e293b] border border-green-500/30 rounded-2xl p-6 flex flex-col"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-green-400">Answer</span>
            <TextToSpeech text={flashcard.answer} size="small" />
          </div>
          <div className="flex-1 flex items-center justify-center px-4">
            <p className="text-lg sm:text-xl text-white text-center leading-relaxed">
              {flashcard.answer}
            </p>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => handleResult(false)}
              className="flex-1 py-2.5 border border-gray-600 text-gray-400 text-sm font-medium rounded-lg
                hover:border-gray-400 hover:text-gray-200 transition-colors"
            >
              Missed it
            </button>
            <button
              onClick={() => handleResult(true)}
              className="flex-1 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg
                hover:bg-green-500 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Flashcard
