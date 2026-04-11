const difficultyOptions = [
  { value: 'all', label: 'All', color: '' },
  { value: 'beginner', label: 'Beginner', color: 'bg-green-900 text-green-300 border-green-700' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-900 text-yellow-300 border-yellow-700' },
  { value: 'advanced', label: 'Advanced', color: 'bg-red-900 text-red-300 border-red-700' },
]

function FilterBar({ categories, selectedCategory, selectedDifficulty, onChange }) {
  const categoryOptions = ['all', ...categories]

  const pillClass = (isActive, colorClass) => {
    if (isActive && colorClass) {
      return `px-3 py-1 text-xs font-medium rounded-full border transition-colors cursor-pointer ${colorClass}`
    }
    if (isActive) {
      return 'px-3 py-1 text-xs font-medium rounded-full border border-green-500 bg-green-900 text-green-300 transition-colors cursor-pointer'
    }
    return 'px-3 py-1 text-xs font-medium rounded-full border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors cursor-pointer'
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500 mr-1">Category:</span>
        {categoryOptions.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange({ category: cat, difficulty: selectedDifficulty })}
            className={pillClass(selectedCategory === cat, '')}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-gray-700 hidden sm:block" />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500 mr-1">Difficulty:</span>
        {difficultyOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ category: selectedCategory, difficulty: opt.value })}
            className={pillClass(selectedDifficulty === opt.value, selectedDifficulty === opt.value ? opt.color : '')}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default FilterBar
