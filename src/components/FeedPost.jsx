import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { getReplies, createReply, toggleReaction, deletePost, deleteReply } from '../lib/feed'

function escapeHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML }

function timeAgo(ds) {
  const s = (Date.now() - new Date(ds)) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const typeBadge = {
  question: { label: '❓ Question', cls: 'bg-yellow-900 text-yellow-300' },
  discussion: { label: '💬 Discussion', cls: 'bg-blue-900 text-blue-300' },
  tip: { label: '💡 Tip', cls: 'bg-green-900 text-green-300' },
}

const QUICK_EMOJIS = ['🎉', '💪', '🔥', '👏', '❤️', '🚀', '💡', '👀']
const FOUNDER_ID = 'user_3CDA0beLEJ7fxHX7i3Q5FyZmNj0'

function FeedPost({ post, currentUserId, onUpdate }) {
  const [showReplies, setShowReplies] = useState(false)
  const [replies, setReplies] = useState([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [showEmojis, setShowEmojis] = useState(false)
  const [expanded, setExpanded] = useState(post.content.length <= 300)
  const [showMenu, setShowMenu] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const isMine = post.user_id === currentUserId
  const reactions = post.emoji_reactions || {}
  const badge = typeBadge[post.type]

  const loadReplies = async () => {
    if (replies.length > 0) { setShowReplies(!showReplies); return }
    setLoadingReplies(true)
    const data = await getReplies(post.id)
    setReplies(data)
    setShowReplies(true)
    setLoadingReplies(false)
  }

  const handleReply = async () => {
    if (!replyText.trim()) return
    const r = await createReply(currentUserId, post.id, replyText)
    if (r) {
      const { data: pr } = await supabase.from('user_profiles').select('display_name, location').eq('user_id', currentUserId).limit(1)
      setReplies((prev) => [...prev, { ...r, userProfile: pr?.[0] || { display_name: 'You' } }])
      setReplyText('')
      onUpdate?.()
    }
  }

  const handleReact = async (emoji) => {
    const updated = await toggleReaction(post.id, currentUserId, emoji)
    if (updated !== null) onUpdate?.()
    setShowEmojis(false)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    await deletePost(post.id, currentUserId)
    onUpdate?.()
  }

  return (
    <div className="rounded-xl border p-4 sm:p-5 bg-[#1e293b] border-gray-700">
      {post.is_pinned && <p className="text-[10px] text-gray-500 mb-2">📌 Pinned</p>}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm font-bold shrink-0">
          {(post.userProfile?.display_name || '?')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{post.userProfile?.display_name || 'Unknown'}</span>
            {post.userProfile?.location && <span className="text-[10px] text-gray-600">{post.userProfile.location}</span>}
            {post.user_id === FOUNDER_ID && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-900 text-green-400">🌱 Founder</span>}
            {badge && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>}
            <span className="text-[10px] text-gray-600">{timeAgo(post.created_at)}</span>
          </div>
        </div>
        {isMine && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="text-gray-600 hover:text-gray-400 p-1">⋯</button>
            {showMenu && (
              <div className="absolute right-0 mt-1 bg-[#111827] border border-gray-700 rounded-lg shadow-xl py-1 z-10 animate-fade-in" onMouseLeave={() => setShowMenu(false)}>
                <button onClick={handleDelete} className="block w-full text-left px-4 py-1.5 text-xs text-red-400 hover:bg-gray-700/50">Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-3">
        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
          {expanded ? escapeHtml(post.content) : escapeHtml(post.content.slice(0, 300)) + '...'}
        </p>
        {post.content.length > 300 && !expanded && (
          <button onClick={() => setExpanded(true)} className="text-xs text-green-400 mt-1">Show more</button>
        )}
        {post.related_course && (
          <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">{post.related_course}</span>
        )}
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="mb-3 relative">
          {!imgLoaded && <div className="w-full h-48 bg-gray-800 rounded-lg animate-pulse" />}
          <img
            src={post.image_url}
            alt="Post attachment"
            onLoad={() => setImgLoaded(true)}
            onClick={() => setLightbox(true)}
            className={`max-w-full max-h-[400px] rounded-lg border border-gray-700/50 cursor-pointer hover:opacity-90 transition-opacity object-cover ${imgLoaded ? '' : 'hidden'}`}
          />
          {post.image_type === 'gif' && imgLoaded && (
            <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">GIF</span>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && post.image_url && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl" onClick={() => setLightbox(false)}>✕</button>
          <img src={post.image_url} alt="Full size" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Reactions */}
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        {Object.entries(reactions).map(([emoji, users]) => (
          <button key={emoji} onClick={() => handleReact(emoji)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
              users.includes(currentUserId) ? 'border-green-500/50 bg-green-500/10 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'
            }`}>
            {emoji} {users.length}
          </button>
        ))}
        <div className="relative">
          <button onClick={() => setShowEmojis(!showEmojis)} className="px-1.5 py-0.5 rounded-full text-xs border border-gray-700 text-gray-600 hover:text-gray-400 transition-colors">+</button>
          {showEmojis && (
            <div className="absolute bottom-full left-0 mb-1 bg-[#111827] border border-gray-700 rounded-lg p-2 flex gap-1 shadow-xl z-10 animate-fade-in">
              {QUICK_EMOJIS.map((e) => (
                <button key={e} onClick={() => handleReact(e)} className="text-lg hover:scale-125 transition-transform p-0.5">{e}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {post.reply_count > 0 && (
        <button onClick={loadReplies} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          {loadingReplies ? 'Loading...' : showReplies ? 'Hide replies' : `${post.reply_count} repl${post.reply_count === 1 ? 'y' : 'ies'}`}
        </button>
      )}

      {showReplies && (
        <div className="mt-3 border-l-2 border-gray-700 pl-3 space-y-2">
          {replies.map((r) => (
            <div key={r.id} className="group/reply flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500/15 flex items-center justify-center text-green-400 text-[10px] font-bold shrink-0">
                {(r.userProfile?.display_name || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-300">{r.userProfile?.display_name}</span>
                  {r.user_id === FOUNDER_ID && <span className="text-[10px] px-1 py-0.5 rounded bg-green-900 text-green-400">🌱</span>}
                  <span className="text-[10px] text-gray-600">{timeAgo(r.created_at)}</span>
                  {r.user_id === currentUserId && (
                    <button onClick={async () => {
                      if (!confirm('Delete this reply?')) return
                      const ok = await deleteReply(r.id, currentUserId, post.id)
                      if (ok) {
                        setReplies((prev) => prev.filter((rep) => rep.id !== r.id))
                        onUpdate?.()
                      }
                    }} className="text-gray-700 hover:text-red-400 text-[10px] opacity-0 group-hover/reply:opacity-100 transition-opacity ml-1" title="Delete reply">
                      🗑
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{escapeHtml(r.content)}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input value={replyText} onChange={(e) => setReplyText(e.target.value.slice(0, 500))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleReply() } }}
              placeholder="Write a reply..." className="flex-1 bg-[#0f172a] text-gray-300 border border-gray-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-green-500 placeholder-gray-600" />
            <button onClick={handleReply} disabled={!replyText.trim()}
              className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-500 disabled:opacity-40 transition-colors">Reply</button>
          </div>
        </div>
      )}

      {/* Reply input for posts with no replies yet */}
      {post.reply_count === 0 && !showReplies && (
        <button onClick={() => { setShowReplies(true); setReplies([]) }} className="text-xs text-gray-600 hover:text-gray-400 transition-colors mt-1">Reply</button>
      )}
    </div>
  )
}

export default FeedPost
