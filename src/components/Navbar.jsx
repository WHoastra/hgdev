import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { getUnreadCount, subscribeToAllMessages } from '../lib/messaging'

function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const [unreadMessages, setUnreadMessages] = useState(0)
  let isSignedIn = false
  let user = null
  let signOut = () => {}

  try {
    const userResult = useUser()
    const clerkResult = useClerk()
    isSignedIn = userResult.isSignedIn
    user = userResult.user
    signOut = clerkResult.signOut
  } catch {}

  useEffect(() => {
    if (!isSignedIn || !user) return
    getUnreadCount(user.id).then(setUnreadMessages)
    const sub = subscribeToAllMessages(user.id, () => {
      getUnreadCount(user.id).then(setUnreadMessages)
    })
    return () => sub.unsubscribe()
  }, [isSignedIn, user?.id])

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const linkClass = (path) => {
    const isActive = pathname.startsWith(path)
    return `text-sm font-medium transition-colors ${
      isActive ? 'text-green-400 border-b-2 border-green-400 pb-0.5' : 'text-gray-400 hover:text-gray-200'
    }`
  }

  const mobileLinkClass = (path) => {
    const isActive = pathname.startsWith(path)
    return `block px-4 py-2 text-sm font-medium transition-colors ${
      isActive ? 'text-green-400 bg-gray-800/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
    }`
  }

  const handleSignOut = async () => {
    setDropdownOpen(false)
    await signOut()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#0f172a] border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-green-500 hover:text-green-400 transition-colors">
            HGDev
          </Link>
          <div className="hidden sm:flex items-center gap-4">
            <Link to="/courses" className={linkClass('/courses')}>Courses</Link>
            <Link to="/progress" className={linkClass('/progress')}>Progress</Link>
            <Link to="/community" className={linkClass('/community')}>Community</Link>
            <Link to="/messages" className={`${linkClass('/messages')} relative`}>
              Messages
              {unreadMessages > 0 && (
                <span className="absolute -top-1.5 -right-3 bg-green-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSignedIn && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img
                  src={user.imageUrl}
                  alt={user.firstName || 'User'}
                  className="w-8 h-8 rounded-full border border-gray-700"
                />
                <span className="text-sm text-gray-300 hidden sm:block">{user.firstName}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[#1e293b] border border-gray-700 rounded-lg shadow-xl py-1 animate-fade-in z-50">
                  <Link
                    to="/progress"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors"
                  >
                    My Progress
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors"
                  >
                    Profile
                  </Link>
                  <div className="border-t border-gray-700 my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-gray-700/50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/sign-in"
              className="text-sm font-medium text-green-400 border border-green-500/50 rounded-full px-4 py-1.5 hover:bg-green-500/10 transition-colors"
            >
              Sign In
            </Link>
          )}

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
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-gray-800 py-2">
          <Link to="/courses" className={mobileLinkClass('/courses')} onClick={() => setMenuOpen(false)}>Courses</Link>
          <Link to="/progress" className={mobileLinkClass('/progress')} onClick={() => setMenuOpen(false)}>Progress</Link>
          <Link to="/community" className={mobileLinkClass('/community')} onClick={() => setMenuOpen(false)}>Community</Link>
          <Link to="/messages" className={mobileLinkClass('/messages')} onClick={() => setMenuOpen(false)}>
            Messages {unreadMessages > 0 && <span className="ml-1 bg-green-500 text-white text-[10px] px-1.5 rounded-full">{unreadMessages}</span>}
          </Link>
        </div>
      )}
    </nav>
  )
}

export default Navbar
