import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const linkClass = (path) => {
    const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path)
    return `text-sm font-medium transition-colors ${
      isActive
        ? 'text-green-400 border-b-2 border-green-400 pb-0.5'
        : 'text-gray-400 hover:text-gray-200'
    }`
  }

  const mobileLinkClass = (path) => {
    const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path)
    return `block px-4 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'text-green-400 bg-gray-800/50'
        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
    }`
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#0f172a] border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-green-500 hover:text-green-400 transition-colors">
            HGDev
          </Link>
          <div className="hidden sm:flex items-center gap-4">
            <Link to="/" className={linkClass('/')}>Courses</Link>
            <Link to="/progress" className={linkClass('/progress')}>Progress</Link>
          </div>
        </div>

        <span className="text-sm text-gray-400 hidden md:block">Homegrown Developers</span>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden text-gray-400 hover:text-gray-200 transition-colors p-1"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-gray-800 py-2">
          <Link to="/" className={mobileLinkClass('/')} onClick={() => setMenuOpen(false)}>
            Courses
          </Link>
          <Link to="/progress" className={mobileLinkClass('/progress')} onClick={() => setMenuOpen(false)}>
            Progress
          </Link>
        </div>
      )}
    </nav>
  )
}

export default Navbar
