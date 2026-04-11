import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center animate-fade-in">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-green-500 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Page not found</h2>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFound
