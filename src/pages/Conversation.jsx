import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useUserId } from '../lib/useUserId'
import { getMessages, sendMessage, markMessagesAsRead, subscribeToMessages, reportMessage } from '../lib/messaging'
import MessageBubble from '../components/MessageBubble'

function dateSeparator(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())

  if (msgDate.getTime() === today.getTime()) return 'Today'
  if (msgDate.getTime() === yesterday.getTime()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function Conversation() {
  const { conversationId } = useParams()
  const { userId } = useUserId()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [otherProfile, setOtherProfile] = useState(null)
  const [otherUserId, setOtherUserId] = useState(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reportMsg, setReportMsg] = useState(null)
  const [reportReason, setReportReason] = useState('spam')
  const [reportDetails, setReportDetails] = useState('')
  const messagesEndRef = useRef(null)
  const scrollAreaRef = useRef(null)

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
  }

  useEffect(() => {
    if (!userId) return

    async function init() {
      // Verify participation
      const { data: convo } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

      if (!convo || (convo.participant_one !== userId && convo.participant_two !== userId)) {
        navigate('/messages')
        return
      }

      const otherId = convo.participant_one === userId ? convo.participant_two : convo.participant_one
      setOtherUserId(otherId)

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('display_name, location, experience_level')
        .eq('user_id', otherId)
        .limit(1)

      setOtherProfile(profile?.[0] || { display_name: 'Unknown' })

      const msgs = await getMessages(conversationId)
      setMessages(msgs)
      await markMessagesAsRead(conversationId, userId)
      setLoading(false)
      setTimeout(() => scrollToBottom(false), 100)
    }
    init()
  }, [conversationId, userId])

  // Realtime subscription
  useEffect(() => {
    if (!userId || loading) return

    const sub = subscribeToMessages(conversationId, (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })
      if (newMsg.sender_id !== userId) {
        markMessagesAsRead(conversationId, userId)
      }
      setTimeout(() => scrollToBottom(), 100)
    })

    return () => sub.unsubscribe()
  }, [conversationId, userId, loading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setSending(true)

    // Optimistic UI
    const optimistic = { id: 'temp-' + Date.now(), conversation_id: conversationId, sender_id: userId, content: text, is_read: false, created_at: new Date().toISOString() }
    setMessages((prev) => [...prev, optimistic])
    setTimeout(() => scrollToBottom(), 50)

    const result = await sendMessage(conversationId, userId, text)
    setSending(false)

    if (result?.error === 'rate_limited') {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      setInput(text)
      alert("You're sending a lot of messages. Take a breather and try again in a few minutes.")
      return
    }

    // Replace optimistic with real
    if (result) {
      setMessages((prev) => prev.map((m) => m.id === optimistic.id ? result : m))
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleReport = async () => {
    if (!reportMsg) return
    await reportMessage(reportMsg.id, userId, reportReason, reportDetails)
    setReportMsg(null)
    setReportReason('spam')
    setReportDetails('')
    alert('Report submitted. Thank you for helping keep HGDev safe.')
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Group messages and add date separators
  let lastDate = null
  let lastSender = null
  let lastTime = 0

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-3 flex items-center gap-3 shrink-0">
        <Link to="/messages" className="text-gray-400 hover:text-green-400 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <Link to={`/member/${otherUserId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold">
            {(otherProfile?.display_name || '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{otherProfile?.display_name}</p>
            {otherProfile?.location && <p className="text-xs text-gray-500">{otherProfile.location}</p>}
          </div>
        </Link>
      </div>

      {/* Messages */}
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">Start of your conversation with {otherProfile?.display_name}</p>
            <p className="text-gray-500 text-sm mt-1">Say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const msgDate = dateSeparator(msg.created_at)
            const showDate = msgDate !== lastDate
            lastDate = msgDate

            const isMine = msg.sender_id === userId
            const msgTime = new Date(msg.created_at).getTime()
            const showName = msg.sender_id !== lastSender || (msgTime - lastTime) > 120000
            lastSender = msg.sender_id
            lastTime = msgTime

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-gray-800" />
                    <span className="text-xs text-gray-600">{msgDate}</span>
                    <div className="flex-1 h-px bg-gray-800" />
                  </div>
                )}
                <MessageBubble
                  message={msg}
                  isMine={isMine}
                  senderName={isMine ? 'You' : otherProfile?.display_name}
                  showName={showName}
                  onReport={setReportMsg}
                />
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 px-4 py-3 shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 2000))}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-[#1e293b] text-gray-300 border border-gray-700 rounded-xl px-4 py-2.5 text-sm resize-none
              focus:outline-none focus:border-green-500 placeholder-gray-600 max-h-32"
            style={{ minHeight: '42px' }}
          />
          <button onClick={handleSend} disabled={!input.trim() || sending}
            className="p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" style={{ transform: 'rotate(45deg)', transformOrigin: 'center' }} />
            </svg>
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {reportMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setReportMsg(null)}>
          <div className="bg-[#111827] border border-gray-700 rounded-xl w-full max-w-[400px] p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Report Message</h3>
            <div className="space-y-2 mb-4">
              {['spam', 'harassment', 'inappropriate', 'other'].map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="reason" value={r} checked={reportReason === r} onChange={() => setReportReason(r)}
                    className="accent-green-500" />
                  <span className="text-sm text-gray-300 capitalize">{r}</span>
                </label>
              ))}
            </div>
            <textarea value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} placeholder="Additional details (optional)..."
              rows={2} className="w-full bg-[#0f172a] text-gray-300 border border-gray-700 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-green-500 placeholder-gray-600 resize-none" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setReportMsg(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200">Cancel</button>
              <button onClick={handleReport} className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-500 transition-colors">Submit Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Conversation
