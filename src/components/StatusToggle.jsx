const options = [
  { value: 'not_started', label: 'Not Started', activeBg: 'bg-gray-600', activeText: 'text-white' },
  { value: 'in_progress', label: 'In Progress', activeBg: 'bg-yellow-500', activeText: 'text-black' },
  { value: 'complete', label: 'Complete', activeBg: 'bg-green-500', activeText: 'text-white' },
]

function StatusToggle({ status, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-gray-700 overflow-hidden">
      {options.map((opt) => {
        const isActive = status === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? `${opt.activeBg} ${opt.activeText}`
                : 'bg-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default StatusToggle
