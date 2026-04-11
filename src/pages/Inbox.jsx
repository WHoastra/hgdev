import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUserId } from '../lib/useUserId'
import { getConversations, getUnreadCount, subscribeToAllMessages } from '../lib/messaging'
import NewMessageModal from '../components/NewMessageModal'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = (now - d) / 1000
  if (diff < 60) return 'now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

function Inbox() {
  const { userId } = useUserId()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalUnread, setTotalUnread] = useState(0)
  const [showNew, setShowNew] = useState(false)
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    if (!userId) return
    const [convos, unread] = await Promise.all([
      getConversations(userId),
      getUnreadCount(userId),
    ])
    setConversations(convos)
    setTotalUnread(unread)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [userId])

  useEffect(() => {
    if (!userId) return
    const sub = subscribeToAllMessages(userId, () => fetchData())
    return () => sub.unsubscribe()
  }, [userId])

  const filtered = search.trim()
    ? conversations.filter((c) => c.otherProfile.display_name?.toLowerCase().includes(search.toLowerCase()))
    : conversations

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Messages</h1>
            {totalUnread > 0 && <p className="text-sm text-green-400 mt-1">{totalUnread} unread message{totalUnread !== 1 ? 's' : ''}</p>}
          </div>
          <button onClick={() => setShowNew(true)}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-500 transition-colors">
            New Message
          </button>
        </div>

        {conversations.length > 1 && (
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..."
            className="w-full bg-[#1e293b] text-gray-300 border border-gray-700 rounded-lg px-4 py-2.5 text-sm mb-4 focus:outline-none focus:border-green-500 placeholder-gray-600" />
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No messages yet</p>
            <p className="text-gray-500 text-sm mb-6">Start a conversation with someone in the community</p>
            <button onClick={() => setShowNew(true)}
              className="px-5 py-2.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 transition-colors">
              Start a Conversation
            </button>
          </div>
        ) : (
          <div className="bg-[#1e293b] rounded-lg border border-gray-700 divide-y divide-gray-700 overflow-hidden">
            {filtered.map((c) => (
              <button key={c.id} onClick={() => navigate(`/messages/${c.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-700/20 transition-colors">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm font-bold shrink-0">
                  {(c.otherProfile.display_name || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${c.unreadCount > 0 ? 'text-white font-semibold' : 'text-gray-300'}`}>
                      {c.otherProfile.display_name || 'Unknown'}
                    </p>
                    <span className="text-xs text-gray-600 shrink-0 ml-2">{timeAgo(c.last_message_at)}</span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${c.unreadCount > 0 ? 'text-gray-300' : 'text-gray-500'}`}>
                    {c.last_message_by === userId ? 'You: ' : ''}{c.last_message_text || 'No messages yet'}
                  </p>
                </div>
                {c.unreadCount > 0 && (
                  <span className="bg-green-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    {c.unreadCount > 9 ? '9+' : c.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <NewMessageModal isOpen={showNew} onClose={() => setShowNew(false)} currentUserId={userId} />
    </div>
  )
}

export default Inbox
