import { useState, useEffect } from 'react'

function getColor(pct) {
  if (pct >= 100) return '#22c55e'
  if (pct >= 76) return '#22c55e'
  if (pct >= 51) return '#3b82f6'
  if (pct >= 26) return '#eab308'
  return '#ef4444'
}

function CompletionRing({ percentage = 0, size = 200, label = 'Overall Progress' }) {
  const [animatedOffset, setAnimatedOffset] = useState(1)
  const strokeWidth = 8
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const targetOffset = 1 - percentage / 100
  const color = getColor(percentage)

  useEffect(() => {
    setAnimatedOffset(1)
    const timer = setTimeout(() => setAnimatedOffset(targetOffset), 50)
    return () => clearTimeout(timer)
  }, [percentage, targetOffset])

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#1e293b" strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * animatedOffset}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out, stroke 0.5s ease' }}
        />
      </svg>
      {percentage >= 100 && (
        <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 30px ${color}30` }} />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{Math.round(percentage)}%</span>
        <span className="text-sm text-gray-400 mt-1">{label}</span>
      </div>
    </div>
  )
}

export default CompletionRing
