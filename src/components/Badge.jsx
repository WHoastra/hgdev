const rarityGlow = {
  common: '',
  uncommon: 'shadow-sm',
  rare: 'shadow-md animate-pulse',
  epic: 'shadow-lg',
  legendary: 'shadow-xl badge-legendary',
}

const sizes = { small: 'w-10 h-10 text-lg', medium: 'w-16 h-16 text-2xl', large: 'w-24 h-24 text-4xl' }

function Badge({ badge, earned = true, size = 'medium', showDetails = false }) {
  const s = sizes[size] || sizes.medium

  return (
    <div className="flex flex-col items-center gap-1.5 group">
      <div
        className={`${s} rounded-xl flex items-center justify-center transition-transform hover:scale-110 ${
          earned
            ? `${rarityGlow[badge.rarity] || ''}`
            : 'grayscale opacity-30'
        }`}
        style={earned ? { backgroundColor: badge.color + '15', border: `1.5px solid ${badge.color}60`, boxShadow: badge.rarity === 'epic' || badge.rarity === 'legendary' ? `0 0 16px ${badge.color}30` : undefined } : { backgroundColor: '#1e293b', border: '1.5px solid #374151' }}
        title={!showDetails ? `${badge.name}: ${badge.description}` : undefined}
      >
        <span>{badge.icon}</span>
      </div>
      {showDetails && (
        <div className="text-center">
          <p className={`text-xs font-medium ${earned ? 'text-white' : 'text-gray-600'}`}>{badge.name}</p>
          <p className="text-[10px] text-gray-500 max-w-[100px]">{earned ? badge.description : '???'}</p>
          {earned && badge.earned_at && (
            <p className="text-[10px] text-green-500">{new Date(badge.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
          )}
          {!earned && <p className="text-[10px] text-gray-700">Locked</p>}
        </div>
      )}
    </div>
  )
}

export default Badge
