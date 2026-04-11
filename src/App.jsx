import { useEffect } from 'react'
import { ClerkProvider, SignIn, SignUp, ClerkLoading, ClerkLoaded } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import CourseDetail from './pages/CourseDetail'
import LessonDetail from './pages/LessonDetail'
import Progress from './pages/Progress'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Quiz from './pages/Quiz'
import Flashcards from './pages/Flashcards'
import Profile from './pages/Profile'
import PublicProfile from './pages/PublicProfile'
import Inbox from './pages/Inbox'
import Conversation from './pages/Conversation'
import Community from './pages/Community'
import NotFound from './pages/NotFound'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: '#22c55e',
    colorBackground: '#1e293b',
    colorInputBackground: '#0f172a',
    colorText: '#f1f5f9',
    colorTextSecondary: '#94a3b8',
    borderRadius: '0.5rem',
  },
  elements: {
    card: 'bg-[#1e293b] border border-gray-700 shadow-xl',
    headerTitle: 'text-white',
    headerSubtitle: 'text-gray-400',
    formButtonPrimary: 'bg-green-600 hover:bg-green-500',
    footerActionLink: 'text-green-400 hover:text-green-300',
    formFieldInput: 'bg-[#0f172a] border-gray-700 text-white',
    dividerLine: 'bg-gray-700',
    dividerText: 'text-gray-500',
  },
}

function AppLayout() {
  const { pathname } = useLocation()
  const isLanding = pathname === '/'
  const isAuth = pathname.startsWith('/sign-')

  useEffect(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }, [pathname])

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      {!isLanding && !isAuth && <Navbar />}
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/sign-in/*" element={
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
              <Link to="/" className="font-heading text-2xl font-bold text-green-500 mb-8">HGDev</Link>
              <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" afterSignInUrl="/courses" />
            </div>
          } />
          <Route path="/sign-up/*" element={
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
              <Link to="/" className="font-heading text-2xl font-bold text-green-500 mb-8">HGDev</Link>
              <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" afterSignUpUrl="/courses" />
            </div>
          } />
          <Route path="/courses" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/course/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
          <Route path="/lesson/:id" element={<ProtectedRoute><LessonDetail /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
          <Route path="/quiz/:moduleId" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          <Route path="/flashcards/:moduleId" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/member/:userId" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
          <Route path="/messages/:conversationId" element={<ProtectedRoute><Conversation /></ProtectedRoute>} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isLanding && !isAuth && (
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
      )}
    </div>
  )
}

function ClerkNavigate() {
  const navigate = useNavigate()
  return { navigate }
}

function App() {
  if (!clerkPubKey) {
    // Fallback: run without auth if no key configured
    return (
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <ClerkProvider publishableKey={clerkPubKey} appearance={clerkAppearance} afterSignOutUrl="/">
        <ClerkLoading>
          <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
            <p className="font-heading text-2xl font-bold text-green-500 mb-4">HGDev</p>
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </ClerkLoading>
        <ClerkLoaded>
          <AppLayout />
        </ClerkLoaded>
      </ClerkProvider>
    </BrowserRouter>
  )
}

export default App
