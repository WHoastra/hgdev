import { useNavigate } from 'react-router-dom'

const catColors = { general: 'bg-green-900 text-green-300', topic: 'bg-blue-900 text-blue-300', parish: 'bg-orange-900 text-orange-300', course: 'bg-purple-900 text-purple-300' }

function ChannelCard({ channel, isMember, unreadCount, onJoin }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (isMember) navigate(`/channels/${channel.slug}`)
  }

  return (
    <div onClick={handleClick}
      className={`bg-[#1e293b] rounded-xl border border-gray-700 p-4 transition-all duration-200 ${isMember ? 'cursor-pointer hover:-translate-y-0.5 hover:border-gray-600' : ''}`}
      style={{ borderLeftWidth: '3px', borderLeftColor: channel.category === 'general' ? '#22c55e' : channel.category === 'topic' ? '#3b82f6' : channel.category === 'parish' ? '#f97316' : '#8b5cf6' }}>
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{channel.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className={`text-sm font-semibold truncate ${unreadCount > 0 ? 'text-white' : 'text-gray-200'}`}>{channel.name}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${catColors[channel.category] || 'bg-gray-700 text-gray-300'}`}>{channel.category}</span>
          </div>
          {channel.description && <p className="text-xs text-gray-500 line-clamp-2 mb-2">{channel.description}</p>}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">{channel.member_count || 0} members</span>
            <div className="flex items-center gap-2">
              {isMember && unreadCount > 0 && (
                <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
              {!isMember && (
                <button onClick={(e) => { e.stopPropagation(); onJoin?.(channel.id) }}
                  className="px-3 py-1 text-xs font-medium text-green-400 border border-green-500/50 rounded-lg hover:bg-green-500/10 transition-colors">
                  Join
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChannelCard
