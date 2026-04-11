import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import CourseDetail from './pages/CourseDetail'
import LessonDetail from './pages/LessonDetail'
import Progress from './pages/Progress'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0f172a] flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/lesson/:id" element={<LessonDetail />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <footer className="border-t border-[#1e293b] py-6 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-600">
              &copy; 2026 <span className="text-gray-500">Whoastra Labs LLC</span> &mdash; All rights reserved
            </p>
            <div className="flex items-center gap-4">
              <Link to="/terms" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
