import { useState, useEffect, useCallback } from 'react'
import { useUserId } from '../lib/useUserId'
import { getFeedPosts, subscribeToFeed } from '../lib/feed'
import FeedPost from './FeedPost'
import FeedInput from './FeedInput'

function PublicFeed() {
  const { userId } = useUserId()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  const fetchPosts = useCallback(async () => {
    const data = await getFeedPosts(30)
    setPosts(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPosts()
    const sub = subscribeToFeed(() => fetchPosts())
    return () => sub.unsubscribe()
  }, [fetchPosts])

  const filtered = tab === 'all' ? posts : posts.filter((p) => p.type === tab)

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'question', label: 'Questions' },
    { key: 'tip', label: 'Tips' },
    { key: 'discussion', label: 'Discussions' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Community Feed 🌱</h2>
          <p className="text-xs text-gray-500 mt-0.5">Ask questions, share wins, celebrate together</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors shrink-0 ${tab === t.key ? 'border-green-500 bg-green-500/15 text-green-400' : 'border-gray-700 text-gray-500 hover:border-gray-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Input */}
      {userId && (
        <div className="mb-4">
          <FeedInput userId={userId} onPost={fetchPosts} />
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <div className="text-center py-10">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400 mb-2">No posts yet</p>
          <p className="text-xs text-gray-600">Be the first to post! Ask a question or share something you learned today.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <FeedPost key={post.id} post={post} currentUserId={userId} onUpdate={fetchPosts} />
          ))}
        </div>
      )}
    </div>
  )
}

export default PublicFeed
