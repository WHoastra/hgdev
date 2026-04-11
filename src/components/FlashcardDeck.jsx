import { useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Flashcard from './Flashcard'

function pickNextCard(cards, progressMap, history, successRate) {
  const lastCardId = history.length > 0 ? history[history.length - 1] : null

  // Score each card for selection
  const scored = cards
    .filter((c) => c.id !== lastCardId)
    .map((card) => {
      const prog = progressMap[card.id]
      const seen = prog?.times_seen || 0
      const correct = prog?.times_correct || 0
      const comfort = prog?.comfort_level || 1
      let score = 0

      // Unseen cards get a bonus
      if (seen === 0) score += 15

      // Adjust based on success rate
      if (successRate > 86) {
        // Too easy — favor harder, less comfortable cards
        score += card.difficulty * 8
        score += (3 - comfort) * 10
        if (seen === 0) score += 10
      } else if (successRate < 78) {
        // Too hard — favor easier, more comfortable cards
        score += (4 - card.difficulty) * 8
        score += comfort * 5
        // Recently missed cards should come back
        if (seen > 0 && correct / seen < 0.5) score += 12
      } else {
        // In the zone — balanced
        score += 5
        if (comfort === 1) score += 6
        if (seen === 0) score += 8
      }

      // Recently missed cards come back sooner
      const recentMissIndex = [...history].reverse().indexOf(card.id)
      if (recentMissIndex === -1 && seen > 0 && correct < seen) score += 5

      // Add randomness to prevent predictability
      score += Math.random() * 8

      return { card, score }
    })

  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.card || cards[0]
}

function FlashcardDeck({ flashcards, progressData, moduleId, courseId, userId }) {
  const [progressMap, setProgressMap] = useState(() => {
    const map = {}
    for (const p of progressData) map[p.flashcard_id] = p
    return map
  })
  const [currentCard, setCurrentCard] = useState(() =>
    pickNextCard(flashcards, {}, [], 82)
  )
  const [cardCount, setCardCount] = useState(1)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const [done, setDone] = useState(false)
  const [autoRead, setAutoRead] = useState(() => {
    try { return localStorage.getItem('tts-autoread') === 'true' } catch { return false }
  })

  const historyRef = useRef([])
  const windowRef = useRef([])

  const getSuccessRate = useCallback(() => {
    if (windowRef.current.length === 0) return 82
    const correct = windowRef.current.filter(Boolean).length
    return Math.round((correct / windowRef.current.length) * 100)
  }, [])

  const getZoneInfo = useCallback(() => {
    const rate = getSuccessRate()
    if (rate >= 78 && rate <= 86) return { emoji: '🎯', label: 'In the zone', color: 'text-green-400' }
    if (rate > 86) return { emoji: '📈', label: 'Ramping up', color: 'text-yellow-400' }
    return { emoji: '📉', label: 'Easing off', color: 'text-red-400' }
  }, [getSuccessRate])

  const handleResult = async ({ cardId, correct }) => {
    // Update rolling window (last 10)
    windowRef.current.push(correct)
    if (windowRef.current.length > 10) windowRef.current.shift()

    // Update history
    historyRef.current.push(cardId)

    // Update session stats
    if (correct) {
      setSessionCorrect((p) => p + 1)
      setStreak((p) => p + 1)
    } else {
      setStreak(0)
    }

    // Update progress in Supabase
    const existing = progressMap[cardId]
    const newSeen = (existing?.times_seen || 0) + 1
    const newCorrect = (existing?.times_correct || 0) + (correct ? 1 : 0)
    const ratio = newSeen > 0 ? newCorrect / newSeen : 0
    let comfort = 1
    if (ratio >= 0.9 && newSeen >= 3) comfort = 3
    else if (ratio >= 0.7 && newSeen >= 2) comfort = 2

    if (existing?.id) {
      await supabase.from('flashcard_progress').update({
        times_seen: newSeen,
        times_correct: newCorrect,
        last_seen: new Date().toISOString(),
        comfort_level: comfort,
      }).eq('id', existing.id)
    } else {
      const { data } = await supabase.from('flashcard_progress').insert({
        flashcard_id: cardId,
        user_id: userId,
        times_seen: newSeen,
        times_correct: newCorrect,
        last_seen: new Date().toISOString(),
        comfort_level: comfort,
      }).select().single()
      if (data) {
        setProgressMap((prev) => ({ ...prev, [cardId]: data }))
      }
    }

    const updatedProg = { ...progressMap[cardId], times_seen: newSeen, times_correct: newCorrect, comfort_level: comfort }
    setProgressMap((prev) => ({ ...prev, [cardId]: updatedProg }))

    // Pick next card
    const rate = getSuccessRate()
    const next = pickNextCard(flashcards, { ...progressMap, [cardId]: updatedProg }, historyRef.current, rate)
    setCurrentCard(next)
    setCardCount((p) => p + 1)
  }

  const handleDone = async () => {
    const total = cardCount - 1
    const pct = total > 0 ? Math.round((sessionCorrect / total) * 100) : 0
    await supabase.from('flashcard_sessions').insert({
      module_id: moduleId,
      user_id: userId,
      total_cards: total,
      correct_count: sessionCorrect,
      session_percentage: pct,
    })
    setDone(true)
  }

  if (done) {
    const total = cardCount - 1
    const pct = total > 0 ? Math.round((sessionCorrect / total) * 100) : 0
    const learning = Object.values(progressMap).filter((p) => p.comfort_level === 1).length
    const familiar = Object.values(progressMap).filter((p) => p.comfort_level === 2).length
    const mastered = Object.values(progressMap).filter((p) => p.comfort_level === 3).length

    let message = 'Keep at it! Every review strengthens your memory. 💪'
    if (pct >= 90) message = 'Outstanding session! Your knowledge is rock solid. 🏆'
    else if (pct >= 80) message = "Great work! You're right in the learning sweet spot. 🎯"
    else if (pct >= 70) message = 'Good session! A few more rounds and you\'ll have it. 📈'

    return (
      <div className="max-w-md mx-auto text-center animate-fade-in">
        <h2 className="text-2xl font-bold text-white mb-2">Session Complete</h2>
        <p className="text-4xl font-bold text-green-500 mb-1">{pct}%</p>
        <p className="text-gray-400 mb-6">{sessionCorrect} correct out of {total} cards</p>
        <p className="text-gray-300 mb-8">{message}</p>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-3">
            <p className="text-lg font-bold text-red-400">{learning}</p>
            <p className="text-xs text-gray-500">Learning</p>
          </div>
          <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-3">
            <p className="text-lg font-bold text-yellow-400">{familiar}</p>
            <p className="text-xs text-gray-500">Familiar</p>
          </div>
          <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-3">
            <p className="text-lg font-bold text-green-400">{mastered}</p>
            <p className="text-xs text-gray-500">Mastered</p>
          </div>
        </div>

        <Link
          to={`/course/${courseId}`}
          className="inline-block px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-500 transition-colors"
        >
          Back to Course
        </Link>
      </div>
    )
  }

  const rate = getSuccessRate()
  const zone = getZoneInfo()
  const rateColor = rate >= 78 && rate <= 86 ? 'text-green-400' : rate > 86 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div>
      {/* HUD */}
      <div className="flex items-center justify-between mb-8 text-sm">
        <span className="text-gray-500">Card {cardCount}</span>
        <div className="flex items-center gap-4">
          {streak >= 3 && (
            <span className="text-orange-400 text-xs">🔥 {streak} streak</span>
          )}
          {windowRef.current.length > 0 && (
            <span className={`text-xs ${rateColor}`}>{rate}%</span>
          )}
          <span className={`text-xs ${zone.color}`}>{zone.emoji} {zone.label}</span>
        </div>
      </div>

      {/* Card */}
      <Flashcard key={currentCard.id + '-' + cardCount} flashcard={currentCard} onResult={handleResult} autoRead={autoRead} />

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-gray-500">
          <input
            type="checkbox"
            checked={autoRead}
            onChange={(e) => {
              setAutoRead(e.target.checked)
              try { localStorage.setItem('tts-autoread', e.target.checked.toString()) } catch {}
            }}
            className="sr-only peer"
          />
          <div className="w-8 h-4 bg-gray-700 rounded-full peer peer-checked:bg-green-600 relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-3 after:h-3 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-4" />
          Auto-read
        </label>
        <button
          onClick={handleDone}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          Done for now
        </button>
      </div>
    </div>
  )
}

export default FlashcardDeck
