import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import CourseDetail from './pages/CourseDetail'
import LessonDetail from './pages/LessonDetail'
import Progress from './pages/Progress'
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <footer className="border-t border-[#1e293b] py-6">
          <p className="text-center text-xs text-gray-600">
            HGDev &mdash; Homegrown Developers &copy; 2026
          </p>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
