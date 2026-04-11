import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getOrCreateConversation, sendMessage } from '../lib/messaging'

function NewMessageModal({ isOpen, onClose, prefillUserId, currentUserId }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (prefillUserId && isOpen) {
      supabase.from('user_profiles').select('user_id, display_name, location, experience_level')
        .eq('user_id', prefillUserId).limit(1).then(({ data }) => {
          if (data?.[0]) setSelectedUser(data[0])
        })
    }
  }, [prefillUserId, isOpen])

  useEffect(() => {
    if (!search.trim() || selectedUser) { setResults([]); return }
    const timer = setTimeout(async () => {
      const { data } = await supabase.from('user_profiles')
        .select('user_id, display_name, location, experience_level')
        .eq('is_public', true)
        .neq('user_id', currentUserId)
        .ilike('display_name', `%${search}%`)
        .limit(5)
      setResults(data || [])
    }, 300)
    return () => clearTimeout(timer)
  }, [search, selectedUser, currentUserId])

  const handleSend = async () => {
    if (!selectedUser || !content.trim()) return
    setSending(true)
    try {
      const convo = await getOrCreateConversation(currentUserId, selectedUser.user_id)
      await sendMessage(convo.id, currentUserId, content)
      onClose()
      navigate(`/messages/${convo.id}`)
    } catch {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div className="bg-[#111827] border border-gray-700 rounded-xl w-full max-w-[500px] p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-white mb-4">New Message</h2>

        {/* Recipient */}
        {selectedUser ? (
          <div className="flex items-center justify-between bg-[#1e293b] rounded-lg px-3 py-2 mb-4">
            <div>
              <p className="text-sm text-white">{selectedUser.display_name}</p>
              {selectedUser.location && <p className="text-xs text-gray-500">{selectedUser.location}</p>}
            </div>
            <button onClick={() => { setSelectedUser(null); setSearch('') }} className="text-gray-500 hover:text-gray-300 text-xs">Change</button>
          </div>
        ) : (
          <div className="relative mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full bg-[#0f172a] text-gray-300 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 placeholder-gray-600"
            />
            {results.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-[#1e293b] border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                {results.map((u) => (
                  <button key={u.user_id} onClick={() => { setSelectedUser(u); setSearch(''); setResults([]) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-700/50 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold shrink-0">
                      {(u.display_name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-white">{u.display_name}</p>
                      <p className="text-xs text-gray-500">{u.location || 'No location'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Message */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 2000))}
          placeholder="Write your message..."
          rows={4}
          className="w-full bg-[#0f172a] text-gray-300 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-500 placeholder-gray-600 resize-none mb-1"
        />
        <p className="text-xs text-gray-600 mb-4 text-right">{content.length}/2000</p>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-700 text-gray-400 text-sm rounded-lg hover:border-gray-500 transition-colors">Cancel</button>
          <button onClick={handleSend} disabled={!selectedUser || !content.trim() || sending}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewMessageModal
