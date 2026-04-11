import { useState } from 'react'

function escapeHtml(text) {
  const d = document.createElement('div'); d.textContent = text; return d.innerHTML
}

function formatTime(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = (now - d) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

const roleBadge = { admin: 'bg-green-900 text-green-400', moderator: 'bg-blue-900 text-blue-400' }

function ChannelMessage({ message, currentUserId, currentUserRole, showHeader, onReply, onDelete, onReport }) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(message.content)
  const [showActions, setShowActions] = useState(false)
  const isMine = message.sender_id === currentUserId
  const canDelete = isMine || currentUserRole === 'admin' || currentUserRole === 'moderator'

  if (message.is_deleted) {
    return (
      <div className="px-4 py-1">
        <p className="text-xs text-gray-600 italic">[Message deleted]</p>
      </div>
    )
  }

  return (
    <div className={`group relative px-4 py-1 hover:bg-white/[0.02] transition-colors ${message.is_pinned ? 'border-l-2 border-green-500/50 bg-green-500/[0.03]' : ''}`}
      onMouseEnter={() => setShowActions(true)} onMouseLeave={() => setShowActions(false)}>

      {/* Reply preview */}
      {message.replyTo && (
        <div className="flex items-center gap-2 ml-12 mb-1 text-xs text-gray-500 border-l-2 border-gray-700 pl-2">
          <span className="font-medium">{message.replyTo.senderName}</span>
          <span className="truncate max-w-[200px]">{message.replyTo.content}</span>
        </div>
      )}

      <div className="flex items-start gap-3">
        {showHeader ? (
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold shrink-0 mt-0.5">
            {(message.senderProfile?.display_name || '?')[0].toUpperCase()}
          </div>
        ) : (
          <div className="w-8 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          {showHeader && (
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-semibold text-white">{message.senderProfile?.display_name || 'Unknown'}</span>
              {message.senderProfile?.location && <span className="text-[10px] text-gray-600">{message.senderProfile.location}</span>}
              {roleBadge[message.role] && <span className={`text-[10px] px-1.5 py-0.5 rounded ${roleBadge[message.role]}`}>{message.role}</span>}
              <span className="text-[10px] text-gray-600">{formatTime(message.created_at)}</span>
              {message.edited_at && <span className="text-[10px] text-gray-700">(edited)</span>}
              {message.is_pinned && <span className="text-[10px] text-green-600">📌</span>}
            </div>
          )}
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-words">{escapeHtml(message.content)}</p>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="absolute right-3 top-0 flex items-center gap-0.5 bg-[#111827] border border-gray-700 rounded-md px-1 py-0.5 shadow-lg">
            <button onClick={() => onReply?.(message)} className="p-1 text-gray-500 hover:text-gray-300 text-xs" title="Reply">↩</button>
            {isMine && <button onClick={() => onDelete?.(message.id)} className="p-1 text-gray-500 hover:text-red-400 text-xs" title="Delete">🗑</button>}
            {!isMine && <button onClick={() => onReport?.(message)} className="p-1 text-gray-500 hover:text-yellow-400 text-xs" title="Report">⚑</button>}
            {!isMine && canDelete && <button onClick={() => onDelete?.(message.id)} className="p-1 text-gray-500 hover:text-red-400 text-xs" title="Delete">🗑</button>}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChannelMessage
