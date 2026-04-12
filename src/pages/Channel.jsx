import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useUserId } from '../lib/useUserId'
import { getChannel, getChannelMessages, sendChannelMessage, deleteChannelMessage, editChannelMessage, deleteAllChannelMessages, updateLastRead, subscribeToChannelMessages, joinChannel, reportChannelMessage } from '../lib/channels'
import { supabase } from '../lib/supabase'
import { compressImage, sanitizeFilename, validateImage } from '../lib/imageUtils'
import ChannelMessage from '../components/ChannelMessage'

function dateSep(dateStr) {
  const d = new Date(dateStr); const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  const md = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  if (md.getTime() === today.getTime()) return 'Today'
  if (md.getTime() === yesterday.getTime()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function Channel() {
  const { slug } = useParams()
  const { userId } = useUserId()
  const navigate = useNavigate()
  const [channel, setChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [isMember, setIsMember] = useState(false)
  const [myRole, setMyRole] = useState('member')
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [replyTo, setReplyTo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reportMsg, setReportMsg] = useState(null)
  const [reportReason, setReportReason] = useState('spam')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadStatus, setUploadStatus] = useState(null)
  const endRef = useRef(null)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = (smooth = true) => endRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })

  useEffect(() => {
    if (!userId) return
    async function init() {
      const ch = await getChannel(slug)
      if (!ch) { navigate('/channels'); return }
      setChannel(ch)

      const { data: mem } = await supabase.from('channel_members').select('role').eq('channel_id', ch.id).eq('user_id', userId).limit(1)
      const member = mem && mem.length > 0
      setIsMember(member)
      if (member) {
        setMyRole(mem[0].role)
        await updateLastRead(ch.id, userId)
      }

      const msgs = await getChannelMessages(ch.id)
      setMessages(msgs)
      setLoading(false)
      setTimeout(() => scrollToBottom(false), 100)
    }
    init()
  }, [slug, userId])

  // Realtime
  useEffect(() => {
    if (!channel || loading) return
    const sub = subscribeToChannelMessages(channel.id, async (newMsg) => {
      const { data: p } = await supabase.from('user_profiles').select('display_name, location').eq('user_id', newMsg.sender_id).limit(1)
      const enriched = { ...newMsg, senderProfile: p?.[0] || { display_name: 'Unknown' }, replyTo: null }
      setMessages((prev) => prev.some((m) => m.id === newMsg.id) ? prev : [...prev, enriched])
      if (isMember) updateLastRead(channel.id, userId)
      setTimeout(() => scrollToBottom(), 100)
    })
    return () => sub.unsubscribe()
  }, [channel, loading, isMember, userId])

  // Paste image support
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    const handlePaste = (e) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) {
            const err = validateImage(file)
            if (!err) handleImageSelected(file)
          }
          break
        }
      }
    }
    el.addEventListener('paste', handlePaste)
    return () => el.removeEventListener('paste', handlePaste)
  }, [isMember])

  const handleImageSelected = (file) => {
    const err = validateImage(file)
    if (err) { alert(err); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleImageRemove = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSend = async () => {
    if ((!input.trim() && !imageFile) || sending || !channel) return
    const text = input; setInput(''); setSending(true)

    let imageUrl = null
    let imageType = null

    if (imageFile) {
      setUploadStatus('Uploading image...')
      try {
        const compressed = await compressImage(imageFile)
        const filename = `${Date.now()}-${sanitizeFilename(imageFile.name)}`
        const path = `${userId}/${filename}`

        const { error: uploadError } = await supabase.storage.from('feed-images').upload(path, compressed, {
          contentType: compressed.type,
          upsert: false,
        })

        if (uploadError) {
          setUploadStatus('Image upload failed. Try again.')
          setInput(text)
          setSending(false)
          return
        }

        const { data: urlData } = supabase.storage.from('feed-images').getPublicUrl(path)
        imageUrl = urlData.publicUrl
        imageType = imageFile.type === 'image/gif' ? 'gif' : 'image'
      } catch {
        setUploadStatus('Image upload failed. Try again.')
        setInput(text)
        setSending(false)
        return
      }
    }

    setUploadStatus(null)
    handleImageRemove()

    const result = await sendChannelMessage(channel.id, userId, text, replyTo?.id, imageUrl, imageType)
    setSending(false); setReplyTo(null)
    if (result?.error === 'rate_limited') {
      setInput(text)
      alert('Slow down! Try again in a few minutes.')
    }
  }

  const handleDelete = async (msgId) => {
    if (!confirm('Delete this message?')) return
    await deleteChannelMessage(msgId, userId, myRole)
    setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, is_deleted: true } : m))
  }

  const handleEdit = async (msgId, newContent) => {
    const success = await editChannelMessage(msgId, userId, newContent)
    if (success) {
      setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, content: newContent, edited_at: new Date().toISOString() } : m))
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete ALL messages in this channel? This cannot be undone.')) return
    const success = await deleteAllChannelMessages(channel.id, userId, myRole)
    if (success) {
      setMessages((prev) => prev.map((m) => ({ ...m, is_deleted: true })))
    }
  }

  const handleJoin = async () => {
    await joinChannel(channel.id, userId)
    setIsMember(true); setMyRole('member')
    await updateLastRead(channel.id, userId)
  }

  const handleReport = async () => {
    if (!reportMsg) return
    await reportChannelMessage(reportMsg.id, userId, reportReason, '')
    setReportMsg(null); alert('Report submitted. Thank you.')
  }

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>

  let lastDate = null; let lastSender = null; let lastTime = 0

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-3 flex items-center gap-3 shrink-0">
        <Link to="/channels" className="text-gray-400 hover:text-green-400 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <span className="text-xl">{channel?.icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">{channel?.name}</p>
          <p className="text-xs text-gray-500 truncate">{channel?.description}</p>
        </div>
        {myRole === 'admin' && messages.some((m) => !m.is_deleted) && (
          <button onClick={handleDeleteAll} className="px-3 py-1.5 text-xs text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete all messages">
            Delete All
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4">
        {messages.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">No messages yet. Be the first to say something!</p>
          </div>
        )}
        {messages.map((msg) => {
          const msgDate = dateSep(msg.created_at)
          const showDate = msgDate !== lastDate; lastDate = msgDate
          const msgTime = new Date(msg.created_at).getTime()
          const showHeader = msg.sender_id !== lastSender || (msgTime - lastTime) > 180000
          lastSender = msg.sender_id; lastTime = msgTime

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="flex items-center gap-3 my-4 px-4">
                  <div className="flex-1 h-px bg-gray-800" />
                  <span className="text-xs text-gray-600">{msgDate}</span>
                  <div className="flex-1 h-px bg-gray-800" />
                </div>
              )}
              <ChannelMessage message={msg} currentUserId={userId} currentUserRole={myRole} showHeader={showHeader}
                onReply={setReplyTo} onDelete={handleDelete} onEdit={handleEdit} onReport={setReportMsg} />
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {/* Reply bar */}
      {replyTo && (
        <div className="border-t border-gray-800 px-4 py-2 flex items-center justify-between bg-[#111827]">
          <div className="text-xs text-gray-400 truncate">Replying to <span className="text-white">{replyTo.senderProfile?.display_name}</span></div>
          <button onClick={() => setReplyTo(null)} className="text-gray-500 hover:text-gray-300 ml-2">✕</button>
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className="border-t border-gray-800 px-4 py-2 bg-[#111827]">
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="max-w-[200px] max-h-[150px] rounded-lg border border-gray-700 object-cover" />
            {imageFile?.type === 'image/gif' && (
              <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">GIF</span>
            )}
            <button onClick={handleImageRemove}
              className="absolute -top-2 -right-2 w-5 h-5 bg-gray-700 hover:bg-red-600 text-white text-xs rounded-full flex items-center justify-center transition-colors">
              ✕
            </button>
          </div>
          {uploadStatus && <p className="text-xs text-yellow-400 mt-1">{uploadStatus}</p>}
        </div>
      )}

      {/* Input */}
      {isMember ? (
        <div className="border-t border-gray-800 px-4 py-3 shrink-0">
          <div className="flex items-end gap-2">
            <button onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-gray-500 hover:text-green-400 transition-colors shrink-0" title="Upload image">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageSelected(f); e.target.value = '' }}
              className="hidden" />
            <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value.slice(0, 2000))}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder={`Message #${channel?.slug || ''}...`} rows={1}
              className="flex-1 bg-[#1e293b] text-gray-300 border border-gray-700 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-green-500 placeholder-gray-600 max-h-32"
              style={{ minHeight: '42px' }} />
            <button onClick={handleSend} disabled={(!input.trim() && !imageFile) || sending}
              className="p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-500 disabled:opacity-40 transition-colors shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-800 px-4 py-4 text-center shrink-0">
          <p className="text-sm text-gray-400 mb-2">Join this channel to send messages</p>
          <button onClick={handleJoin} className="px-5 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 transition-colors">Join Channel</button>
        </div>
      )}

      {/* Report Modal */}
      {reportMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setReportMsg(null)}>
          <div className="bg-[#111827] border border-gray-700 rounded-xl w-full max-w-[400px] p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Report Message</h3>
            <div className="space-y-2 mb-4">
              {['spam', 'harassment', 'inappropriate', 'off_topic', 'other'].map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="reason" value={r} checked={reportReason === r} onChange={() => setReportReason(r)} className="accent-green-500" />
                  <span className="text-sm text-gray-300 capitalize">{r.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setReportMsg(null)} className="px-4 py-2 text-sm text-gray-400">Cancel</button>
              <button onClick={handleReport} className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-500">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Channel
