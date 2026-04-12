import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotifications, getUnreadNotificationCount, markNotificationRead, markAllNotificationsRead, subscribeToNotifications } from '../lib/notifications'

function timeAgo(ds) {
  const s = (Date.now() - new Date(ds)) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const typeIcon = {
  reply: '💬',
  reaction: '🎉',
  dm: '✉️',
  channel_reply: '📢',
  badge: '🏆',
}

function NotificationBell({ userId }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef(null)
  const navigate = useNavigate()

  // Fetch unread count on mount
  useEffect(() => {
    if (!userId) return
    getUnreadNotificationCount(userId).then(setUnreadCount)
    const sub = subscribeToNotifications(userId, () => {
      getUnreadNotificationCount(userId).then(setUnreadCount)
    })
    return () => sub.unsubscribe()
  }, [userId])

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleOpen = async () => {
    if (open) { setOpen(false); return }
    setOpen(true)
    setLoading(true)
    const data = await getNotifications(userId, 20)
    setNotifications(data)
    setLoading(false)
  }

  const handleClick = async (notif) => {
    if (!notif.is_read) {
      await markNotificationRead(notif.id)
      setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n))
      setUnreadCount((c) => Math.max(0, c - 1))
    }
    setOpen(false)
    if (notif.link) navigate(notif.link)
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead(userId)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  return (
    <div className="relative" ref={panelRef}>
      <button onClick={handleOpen} className="relative p-1.5 text-gray-400 hover:text-gray-200 transition-colors" title="Notifications">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-green-500 text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111827] border border-gray-700 rounded-xl shadow-2xl z-50 animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-[10px] text-green-400 hover:text-green-300 transition-colors">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-600 text-xs mt-1">You'll see activity here when people interact with your posts</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-white/[0.03] transition-colors border-b border-gray-800/50 ${
                    !n.is_read ? 'bg-green-500/[0.04]' : ''
                  }`}
                >
                  <span className="text-lg shrink-0 mt-0.5">{typeIcon[n.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {n.senderName && <span className="text-xs font-semibold text-white">{n.senderName}</span>}
                      <span className="text-xs text-gray-400">{n.title}</span>
                      {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />}
                    </div>
                    {n.body && <p className="text-[11px] text-gray-500 truncate mt-0.5">{n.body}</p>}
                    <p className="text-[10px] text-gray-600 mt-0.5">{timeAgo(n.created_at)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
