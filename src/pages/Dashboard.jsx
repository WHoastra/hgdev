import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useUserId } from '../lib/useUserId'
import CourseCard from '../components/CourseCard'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import PublicFeed from '../components/PublicFeed'

function Dashboard() {
  const { userId, isLoaded } = useUserId()
  const [courses, setCourses] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showProfileBanner, setShowProfileBanner] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

  useEffect(() => {
    if (!isLoaded || !userId) return

    async function fetchCourses() {
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('sort_order', { ascending: true, nullsFirst: false })

      if (coursesError) {
        setLoading(false)
        return
      }

      const progressByCourse = {}

      for (const course of coursesData) {
        const { data: modules } = await supabase
          .from('modules')
          .select('id')
          .eq('course_id', course.id)

        if (!modules || modules.length === 0) {
          progressByCourse[course.id] = { completedLessons: 0, totalLessons: 0, percentage: 0 }
          continue
        }

        const moduleIds = modules.map((m) => m.id)

        const { data: lessons } = await supabase
          .from('lessons')
          .select('id')
          .in('module_id', moduleIds)

        if (!lessons || lessons.length === 0) {
          progressByCourse[course.id] = { completedLessons: 0, totalLessons: 0, percentage: 0 }
          continue
        }

        const lessonIds = lessons.map((l) => l.id)

        const { data: progressRecords } = await supabase
          .from('progress')
          .select('status')
          .in('lesson_id', lessonIds)
          .eq('user_id', userId)

        const completed = progressRecords
          ? progressRecords.filter((p) => p.status === 'complete').length
          : 0

        const total = lessons.length
        progressByCourse[course.id] = {
          completedLessons: completed,
          totalLessons: total,
          percentage: total > 0 ? (completed / total) * 100 : 0,
        }
      }

      setCourses(coursesData)
      setProgressMap(progressByCourse)

      const dismissed = localStorage.getItem('hgdev-profile-banner-dismissed')
      if (!dismissed) {
        const { data: profileData } = await supabase.from('user_profiles').select('profile_complete').eq('user_id', userId).limit(1)
        if (!profileData || profileData.length === 0 || !profileData[0].profile_complete) {
          setShowProfileBanner(true)
        }
      }

      setLoading(false)
    }

    fetchCourses()
  }, [userId, isLoaded])

  const categories = useMemo(() => {
    const cats = new Set()
    courses.forEach((c) => { if (c.category) cats.add(c.category) })
    return [...cats]
  }, [courses])

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matchesSearch =
          course.title.toLowerCase().includes(term) ||
          (course.description && course.description.toLowerCase().includes(term)) ||
          (course.category && course.category.toLowerCase().includes(term))
        if (!matchesSearch) return false
      }
      if (selectedCategory !== 'all' && course.category !== selectedCategory) return false
      if (selectedDifficulty !== 'all' && course.difficulty !== selectedDifficulty) return false
      return true
    })
  }, [courses, searchTerm, selectedCategory, selectedDifficulty])

  const handleFilterChange = ({ category, difficulty }) => {
    setSelectedCategory(category)
    setSelectedDifficulty(difficulty)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {showProfileBanner && (
          <div className="bg-[#1e293b] border border-green-500/30 rounded-lg p-4 mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-200">Welcome to HGDev! Complete your profile to connect with other developers in Southern Louisiana.</p>
            <div className="flex items-center gap-2 shrink-0">
              <Link to="/profile" className="px-4 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-500 transition-colors">
                Set Up Profile
              </Link>
              <button onClick={() => { setShowProfileBanner(false); localStorage.setItem('hgdev-profile-banner-dismissed', 'true') }}
                className="text-gray-500 hover:text-gray-300 transition-colors p-1" aria-label="Dismiss">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Your Courses</h1>
          <p className="text-gray-400 mt-1">Track your progress through each course</p>
        </div>

        {/* Search & Filters (full width) */}
        <div className="space-y-4 mb-6">
          <SearchBar onChange={setSearchTerm} />
          {categories.length > 0 && (
            <FilterBar
              categories={categories}
              selectedCategory={selectedCategory}
              selectedDifficulty={selectedDifficulty}
              onChange={handleFilterChange}
            />
          )}
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT — Courses */}
          <div className="flex-1 lg:w-[60%] min-w-0">
            <p className="text-xs text-gray-500 mb-4">
              Showing {filteredCourses.length} of {courses.length} courses
            </p>

            {courses.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">No courses yet</h3>
                <p className="text-gray-500">Courses will appear here once they're added.</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">No courses match your filters</h3>
                <p className="text-gray-500">Try adjusting your search.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    progress={progressMap[course.id] || { completedLessons: 0, totalLessons: 0, percentage: 0 }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Community Feed */}
          <div className="lg:w-[40%] lg:border-l lg:border-gray-800 lg:pl-6">
            <div className="lg:sticky lg:top-[72px] lg:max-h-[calc(100vh-90px)] lg:overflow-y-auto lg:pr-1 feed-scroll">
              <PublicFeed />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
