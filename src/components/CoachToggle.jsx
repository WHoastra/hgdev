import { useState, useEffect } from 'react'
import Coach from './Coach'

function CoachToggle({ contextType, contextId, contextData }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('hgdev-coach-hint-seen')
    if (!seen) {
      setShowHint(true)
      const timer = setTimeout(() => { setShowHint(false); localStorage.setItem('hgdev-coach-hint-seen', 'true') }, 6000)
      return () => clearTimeout(timer)
    }
  }, [])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') setIsOpen(false) }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen])

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => { setIsOpen(!isOpen); setShowHint(false) }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-14 sm:h-14 rounded-full shadow-lg transition-all duration-200
          ${isOpen
            ? 'bg-gray-700 hover:bg-gray-600 rotate-90'
            : 'bg-green-600 hover:bg-green-500 hover:scale-105 shadow-green-500/20'
          }`}
        aria-label={isOpen ? 'Close coach' : 'Open coach'}
      >
        {isOpen ? (
          <svg className="w-6 h-6 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-2xl">🌱</span>
        )}
      </button>

      {/* Hint */}
      {showHint && !isOpen && (
        <div className="fixed bottom-[84px] right-6 z-50 bg-[#1e293b] border border-gray-700 rounded-lg px-3 py-2 shadow-xl animate-fade-in">
          <p className="text-xs text-gray-300">Need help? Ask your coach</p>
          <button onClick={() => { setShowHint(false); localStorage.setItem('hgdev-coach-hint-seen', 'true') }}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gray-600 text-white text-[10px] rounded-full flex items-center justify-center">✕</button>
        </div>
      )}

      {/* Coach Panel */}
      <Coach
        contextType={contextType}
        contextId={contextId}
        contextData={contextData}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}

export default CoachToggle
