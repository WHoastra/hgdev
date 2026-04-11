import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { createPost } from '../lib/feed'

const TYPES = [
  { value: 'question', label: '❓ Question' },
  { value: 'discussion', label: '💬 Discussion' },
  { value: 'tip', label: '💡 Tip' },
]

function FeedInput({ userId, onPost }) {
  const [content, setContent] = useState('')
  const [type, setType] = useState('question')
  const [course, setCourse] = useState('')
  const [courses, setCourses] = useState([])
  const [focused, setFocused] = useState(false)
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    supabase.from('courses').select('title').order('title').then(({ data }) => setCourses(data || []))
  }, [])

  const handlePost = async () => {
    if (!content.trim() || posting) return
    setPosting(true)
    const result = await createPost(userId, type, content, course || null)
    setPosting(false)
    if (result?.error === 'rate_limited') {
      alert("You're on fire! Take a breather and come back in a few minutes.")
      return
    }
    if (result) {
      setContent(''); setType('question'); setCourse(''); setFocused(false)
      onPost?.()
    }
  }

  return (
    <div className="bg-[#1e293b] rounded-xl border border-gray-700 p-4">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm font-bold shrink-0">
          Y
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 1000))}
            onFocus={() => setFocused(true)}
            placeholder="Ask a question, share a tip, or start a discussion..."
            rows={focused || content ? 3 : 1}
            className="w-full bg-[#111827] text-gray-300 border border-gray-700 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-green-500 placeholder-gray-600 transition-all"
          />
          {content.length > 800 && <p className="text-[10px] text-gray-600 mt-1 text-right">{content.length}/1000</p>}

          {(focused || content) && (
            <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {TYPES.map((t) => (
                  <button key={t.value} onClick={() => setType(t.value)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${type === t.value ? 'border-green-500 bg-green-500/15 text-green-400' : 'border-gray-700 text-gray-500 hover:border-gray-500'}`}>
                    {t.label}
                  </button>
                ))}
                <select value={course} onChange={(e) => setCourse(e.target.value)}
                  className="bg-[#0f172a] border border-gray-700 text-gray-500 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-green-500">
                  <option value="">Add course tag</option>
                  {courses.map((c) => <option key={c.title} value={c.title}>{c.title}</option>)}
                </select>
              </div>
              <button onClick={handlePost} disabled={!content.trim() || posting}
                className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-500 disabled:opacity-40 transition-colors">
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FeedInput
