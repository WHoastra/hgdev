import { useState, useEffect, useRef } from 'react'
import { sendCoachMessage, saveConversation, loadConversation } from '../lib/coach'
import { useUserId } from '../lib/useUserId'

function timeAgo(ts) {
  const s = (Date.now() - new Date(ts)) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

const INITIAL_MESSAGES = {
  lesson: (title) => `Hey! I see you're working on "${title}". What part are you trying to understand? I'm here to help you think through it — not give you the answers. 😉`,
  quiz: () => "Working through the quiz? Nice! If you're stuck on a question, tell me what you're thinking and I'll help you reason through it. No spoilers though — you've got to earn that score! 💪",
  flashcard: () => "Flashcard time! If a concept isn't clicking, talk me through what you do know and I'll help you connect the dots. 🧩",
  general: () => "What's on your mind? I'm here to help you learn — ask me anything about your courses or goals. Just know I'll make you think for it! 🌱",
}

const QUICK_PROMPTS = {
  lesson: ['Explain this differently', 'Give me an analogy', 'Check my understanding', 'What should I focus on?'],
  quiz: ['Help me think through this', 'What concept is this testing?', "I'm stuck on this question"],
  flashcard: ['Break this concept down', 'Why does this matter?', 'Give me a hint'],
  general: ['What should I learn next?', 'How do I stay motivated?', 'Explain a concept to me'],
}

function Coach({ contextType, contextId, contextData, isOpen, onClose }) {
  const { userId } = useUserId()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const endRef = useRef(null)
  const msgCountRef = useRef(0)

  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' })

  // Load conversation and show initial message
  useEffect(() => {
    if (!isOpen || !userId || initialized) return

    async function init() {
      const saved = await loadConversation(userId, contextType, contextId)
      if (saved.length > 0) {
        setMessages(saved)
      } else {
        const initFn = INITIAL_MESSAGES[contextType] || INITIAL_MESSAGES.general
        const greeting = initFn(contextData?.title || '')
        setMessages([{ role: 'assistant', content: greeting, timestamp: new Date().toISOString() }])
      }
      setInitialized(true)
      setTimeout(scrollToBottom, 100)
    }
    init()
  }, [isOpen, userId, initialized, contextType, contextId])

  // Save on close
  useEffect(() => {
    if (!isOpen && initialized && userId && messages.length > 0) {
      saveConversation(userId, contextType, contextId, messages)
    }
  }, [isOpen])

  // Auto-save every 5 messages
  useEffect(() => {
    if (messages.length > 0 && messages.length % 5 === 0 && userId) {
      saveConversation(userId, contextType, contextId, messages)
    }
  }, [messages.length])

  const handleSend = async (text) => {
    const content = (text || input).trim()
    if (!content || loading) return
    setInput('')

    const userMsg = { role: 'user', content, timestamp: new Date().toISOString() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)
    setTimeout(scrollToBottom, 50)

    const context = contextData ? { type: contextType, ...contextData } : { type: 'general' }
    const result = await sendCoachMessage(newMessages, context)

    if (result.error) {
      setMessages([...newMessages, { role: 'assistant', content: result.error, timestamp: new Date().toISOString(), isError: true }])
    } else {
      setMessages([...newMessages, { role: 'assistant', content: result.content, timestamp: new Date().toISOString() }])
    }
    setLoading(false)
    setTimeout(scrollToBottom, 100)
  }

  if (!isOpen) return null

  const prompts = QUICK_PROMPTS[contextType] || QUICK_PROMPTS.general
  const showPrompts = messages.length <= 1

  return (
    <div className="fixed top-14 right-0 bottom-0 w-full sm:w-[400px] bg-[#111827] border-l border-green-500/20 z-40 flex flex-col animate-fade-in" style={{ animation: 'slideInRight 0.3s ease-out' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">HGDev Coach</span>
            <span className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          {contextData?.title && (
            <p className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[250px]">Helping with: {contextData.title}</p>
          )}
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors p-1" aria-label="Close coach">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 feed-scroll">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user'
              ? 'bg-[#1e3a5f] rounded-2xl rounded-br-md px-4 py-2.5'
              : `bg-[#1e293b] border-l-2 ${msg.isError ? 'border-red-500' : 'border-green-500'} rounded-2xl rounded-bl-md px-4 py-2.5`
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
            <div className="bg-[#1e293b] border-l-2 border-green-500 rounded-2xl rounded-bl-md px-4 py-3">
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
            {prompts.map((p) => (
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
      <div className="px-4 py-3 border-t border-gray-800 shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 1000))}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Ask your coach..."
            disabled={loading}
            className="flex-1 bg-[#1e293b] text-gray-300 border border-gray-700 rounded-xl px-4 py-2.5 text-sm
              focus:outline-none focus:border-green-500 placeholder-gray-600 disabled:opacity-50"
            aria-label="Message to coach"
          />
          <button onClick={() => handleSend()} disabled={!input.trim() || loading}
            className="p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-500 disabled:opacity-40 transition-colors shrink-0"
            aria-label="Send message">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Coach
