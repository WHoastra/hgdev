function ProgressBar({ percentage = 0 }) {
  const clamped = Math.min(100, Math.max(0, Math.round(percentage)))
  const isComplete = clamped === 100

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete ? 'bg-yellow-400' : 'bg-green-500'
          }`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span
        className={`text-sm font-medium min-w-[3rem] text-right ${
          isComplete ? 'text-yellow-400' : 'text-gray-400'
        }`}
      >
        {clamped}%
      </span>
    </div>
  )
}

export default ProgressBar
