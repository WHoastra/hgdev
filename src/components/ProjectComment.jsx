import { useState } from 'react'

function ProjectComment({ comment, currentUserId, founderId, onDelete }) {
  const [showLightbox, setShowLightbox] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const canDelete = currentUserId === comment.user_id || currentUserId === founderId
  const displayName = comment.senderProfile?.display_name || 'Unknown'
  const initial = displayName.charAt(0).toUpperCase()
  const timeAgo = formatTimeAgo(comment.created_at)

  return (
    <div className="group flex gap-3 py-3">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-green-600/20 text-green-400 flex items-center justify-center text-xs font-bold shrink-0">
        {initial}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white">{displayName}</span>
          {comment.senderProfile?.location && (
            <span className="text-[10px] text-gray-600">{comment.senderProfile.location}</span>
          )}
          <span className="text-[10px] text-gray-600">{timeAgo}</span>

          {/* Delete button */}
          {canDelete && !confirmDelete && (
            <button onClick={() => setConfirmDelete(true)}
              className="ml-auto opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all text-xs">
              Delete
            </button>
          )}
          {confirmDelete && (
            <div className="ml-auto flex gap-2">
              <button onClick={() => { onDelete(comment.id); setConfirmDelete(false) }}
                className="text-xs text-red-400 hover:text-red-300 font-medium">Confirm</button>
              <button onClick={() => setConfirmDelete(false)}
                className="text-xs text-gray-500 hover:text-gray-400">Cancel</button>
            </div>
          )}
        </div>

        {/* Content */}
        {comment.content && (
          <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">{comment.content}</p>
        )}

        {/* Media */}
        {comment.media_url && comment.media_type === 'video' && (
          <video src={comment.media_url} controls
            className="mt-2 max-w-[400px] max-h-[300px] rounded-lg border border-gray-700" />
        )}
        {comment.media_url && (comment.media_type === 'image' || comment.media_type === 'gif') && (
          <>
            <img src={comment.media_url} alt="" onClick={() => setShowLightbox(true)}
              className="mt-2 max-w-[300px] max-h-[200px] rounded-lg border border-gray-700 cursor-pointer hover:opacity-90 object-cover" />
            {comment.media_type === 'gif' && (
              <span className="inline-block mt-1 text-[10px] text-purple-400 bg-purple-900/30 px-1.5 py-0.5 rounded">GIF</span>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && comment.media_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setShowLightbox(false)}>
          <img src={comment.media_url} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}
    </div>
  )
}

function formatTimeAgo(dateStr) {
  const now = Date.now()
  const d = new Date(dateStr).getTime()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default ProjectComment
