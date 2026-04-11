import { useState } from 'react'

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function formatTime(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = (now - d) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function MessageBubble({ message, isMine, senderName, showName, onReport }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleContextMenu = (e) => {
    if (!isMine) {
      e.preventDefault()
      setMenuOpen(true)
    }
  }

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1 ${showName ? 'mt-3' : ''}`}>
      <div className="max-w-[75%] relative" onContextMenu={handleContextMenu}>
        {showName && !isMine && (
          <p className="text-xs text-gray-500 mb-1 ml-1">{senderName}</p>
        )}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isMine
            ? 'bg-[#0f2818] text-gray-200 rounded-br-md'
            : 'bg-[#1e293b] text-gray-300 rounded-bl-md'
        }`}>
          <p className="whitespace-pre-wrap break-words">{escapeHtml(message.content)}</p>
        </div>
        <div className={`flex items-center gap-1.5 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'} px-1`}>
          <span className="text-[10px] text-gray-600">{formatTime(message.created_at)}</span>
          {isMine && (
            <span className={`text-[10px] ${message.is_read ? 'text-green-500' : 'text-gray-600'}`}>
              {message.is_read ? '✓✓' : '✓'}
            </span>
          )}
        </div>

        {menuOpen && !isMine && (
          <div className="absolute top-0 left-0 z-10 bg-[#111827] border border-gray-700 rounded-lg shadow-xl py-1 min-w-[120px] animate-fade-in"
            onMouseLeave={() => setMenuOpen(false)}>
            <button onClick={() => { navigator.clipboard.writeText(message.content); setMenuOpen(false) }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700/50">Copy</button>
            <button onClick={() => { setMenuOpen(false); onReport?.(message) }}
              className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-gray-700/50">Report</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageBubble
