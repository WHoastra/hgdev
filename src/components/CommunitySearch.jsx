import { useState, useEffect, useRef } from 'react'

function CommunitySearch({ onSearch, initialQuery = '' }) {
  const [value, setValue] = useState(initialQuery)
  const timer = useRef(null)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const handleChange = (e) => {
    const v = e.target.value
    setValue(v)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => onSearch(v), 400)
  }

  return (
    <div className="relative">
      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
      </svg>
      <input type="text" value={value} onChange={handleChange} placeholder="Search by name, skill, location, or interest..."
        className="w-full bg-[#1e293b] text-white text-sm border border-gray-700 rounded-lg pl-10 pr-9 py-3 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors" />
      {value && (
        <button onClick={() => { setValue(''); onSearch('') }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default CommunitySearch
