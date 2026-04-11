import { useState, useEffect, useRef } from 'react'
import { sendCoachMessage, saveConversation, loadConversation } from '../lib/coach'
import { useUserId } from '../lib/useUserId'

function timeAgo(ts) {
  const s = (Date.now() - new Date(ts)) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

const QUICK_PROMPTS = [
  'Explain this in simpler terms',
  'Give me a real-world example',
  "What's the most important takeaway?",
  'Quiz me on this lesson',
  'How does this connect to what I learned before?',
]

function LessonChat({ lesson, module, course }) {
  const { userId } = useUserId()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [loadedPrevious, setLoadedPrevious] = useState(false)
  const endRef = useRef(null)

  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' })

  useEffect(() => {
    if (!userId || !lesson) return

    async function init() {
      const saved = await loadConversation(userId, 'lesson', lesson.id)
      if (saved.length > 0) {
        setMessages(saved)
        setLoadedPrevious(true)
      } else {
        setMessages([{
          role: 'assistant',
          content: `Hey! I just read through "${lesson.title}" with you. What stuck out? What's confusing? Let's dig into it — I'll help you think through the concepts, but you've got to do the thinking. 😉`,
          timestamp: new Date().toISOString(),
        }])
      }
      setInitialized(true)
      setTimeout(scrollToBottom, 100)
    }
    init()
  }, [userId, lesson?.id])

  // Save on unmount
  useEffect(() => {
    return () => {
      if (userId && lesson && messages.length > 0) {
        saveConversation(userId, 'lesson', lesson.id, messages)
      }
    }
  }, [messages])

  // Auto-save every 5 messages
  useEffect(() => {
    if (messages.length > 1 && messages.length % 5 === 0 && userId && lesson) {
      saveConversation(userId, 'lesson', lesson.id, messages)
    }
  }, [messages.length])

  const handleSend = async (text) => {
    const content = (text || input).trim()
    if (!content || loading) return
    setInput('')
    setLoadedPrevious(false)

    const userMsg = { role: 'user', content, timestamp: new Date().toISOString() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)
    setTimeout(scrollToBottom, 50)

    const context = {
      type: 'lesson',
      title: lesson.title,
      moduleTitle: module?.title || '',
      courseTitle: course?.title || '',
      contentSummary: lesson.content || '',
    }

    const result = await sendCoachMessage(newMessages, context)
    if (result.error) {
      setMessages([...newMessages, { role: 'assistant', content: result.error, timestamp: new Date().toISOString(), isError: true }])
    } else {
      setMessages([...newMessages, { role: 'assistant', content: result.content, timestamp: new Date().toISOString() }])
    }
    setLoading(false)
    setTimeout(scrollToBottom, 100)
  }

  const showPrompts = messages.length <= 1

  return (
    <div className="bg-[#1e293b] rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">Discuss this lesson with Coach</h2>
          <span className="w-2 h-2 rounded-full bg-green-500" />
        </div>
        <p className="text-xs text-gray-500 mt-0.5">Ask questions, explore ideas, and deepen your understanding</p>
        {loadedPrevious && <p className="text-[10px] text-gray-600 mt-1">Previous conversation loaded</p>}
      </div>

      {/* Messages */}
      <div className="px-4 py-4 space-y-3 overflow-y-auto feed-scroll" style={{ minHeight: '300px', maxHeight: '500px' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user'
              ? 'bg-[#1e3a5f] rounded-2xl rounded-br-md px-4 py-2.5'
              : `bg-[#111827] ${msg.isError ? 'border-l-2 border-red-500' : ''} rounded-2xl rounded-bl-md px-4 py-2.5`
            }`}>
              {msg.role === 'assistant' && (
                <p className="text-[10px] text-green-500 font-medium mb-1">🌱 Coach</p>
              )}
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <p className="text-[10px] text-gray-600 mt-1">{timeAgo(msg.timestamp)}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#111827] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}

        {showPrompts && (
          <div className="flex flex-wrap gap-2 mt-2">
            {QUICK_PROMPTS.map((p) => (
              <button key={p} onClick={() => handleSend(p)}
                className="px-3 py-1.5 text-xs border border-green-500/40 text-green-400 rounded-full hover:bg-green-500/10 transition-colors">
                {p}
              </button>
            ))}
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 1000))}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Ask about this lesson..."
            disabled={loading}
            className="flex-1 bg-[#0f172a] text-gray-300 border border-gray-700 rounded-xl px-4 py-2.5 text-sm
              focus:outline-none focus:border-green-500 placeholder-gray-600 disabled:opacity-50"
          />
          <button onClick={() => handleSend()} disabled={!input.trim() || loading}
            className="p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-500 disabled:opacity-40 transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default LessonChat
