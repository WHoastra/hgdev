const levelColors = {
  learning: 'border-yellow-500/50 text-yellow-400',
  comfortable: 'border-blue-500/50 text-blue-400',
  confident: 'border-green-500/50 text-green-400',
}

const levelDot = {
  learning: 'bg-yellow-500',
  comfortable: 'bg-blue-500',
  confident: 'bg-green-500',
}

function SkillTag({ name, level, removable, onRemove }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium bg-[#0f172a] ${levelColors[level] || 'border-gray-700 text-gray-400'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${levelDot[level] || 'bg-gray-500'}`} />
      {name}
      {removable && (
        <button onClick={onRemove} className="ml-0.5 hover:text-white transition-colors" aria-label={`Remove ${name}`}>
          &times;
        </button>
      )}
    </span>
  )
}

export default SkillTag
