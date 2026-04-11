import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const rarityColors = { common: 'text-green-400', uncommon: 'text-blue-400', rare: 'text-purple-400', epic: 'text-amber-400', legendary: 'text-yellow-300' }
const rarityBg = { common: 'bg-green-900', uncommon: 'bg-blue-900', rare: 'bg-purple-900', epic: 'bg-amber-900', legendary: 'bg-yellow-900' }

function BadgeToast({ badge, onClose }) {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      onClick={() => { onClose(); navigate('/badges') }}
      className="fixed top-20 right-4 z-[60] max-w-sm bg-[#111827] border border-gray-700 rounded-xl shadow-2xl p-4 cursor-pointer animate-fade-in"
      style={{ borderLeftWidth: '3px', borderLeftColor: badge.color, animation: 'slideInRight 0.4s ease-out' }}
    >
      <button onClick={(e) => { e.stopPropagation(); onClose() }} className="absolute top-2 right-2 text-gray-600 hover:text-gray-400 text-xs">✕</button>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: badge.color + '20', border: `1.5px solid ${badge.color}50` }}>
          {badge.icon}
        </div>
        <div>
          <p className="text-[10px] text-green-400 font-medium">Badge Earned!</p>
          <p className="text-sm font-semibold text-white">{badge.name}</p>
          <p className="text-xs text-gray-400">{badge.description}</p>
          <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full ${rarityBg[badge.rarity]} ${rarityColors[badge.rarity]}`}>
            {badge.rarity}
          </span>
        </div>
      </div>
    </div>
  )
}

export default BadgeToast
