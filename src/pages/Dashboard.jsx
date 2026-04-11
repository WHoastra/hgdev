import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { seedAllQuizzes } from '../lib/seedQuizzes'
import { seedAllFlashcards } from '../lib/seedFlashcards'
import CourseCard from '../components/CourseCard'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'

function Dashboard() {
  const [courses, setCourses] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

  useEffect(() => {
    async function fetchCourses() {
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at')

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
      setLoading(false)
    }

    fetchCourses()
  }, [])

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
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Your Courses</h1>
            <p className="text-gray-400 mt-1">Track your progress through each course</p>
          </div>
          <button
            onClick={async () => {
              if (!confirm('Load quiz questions for all modules?')) return
              try {
                const result = await seedAllQuizzes()
                alert(`Loaded ${result.questions} questions across ${result.modules} modules!`)
              } catch (e) {
                alert('Failed: ' + e.message)
              }
            }}
            className="px-3 py-1.5 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600 transition-colors shrink-0"
          >
            Load Quizzes
          </button>
          <button
            onClick={async () => {
              if (!confirm('Load flashcards for all modules?')) return
              try {
                const result = await seedAllFlashcards()
                alert(`Loaded ${result.flashcards} flashcards across ${result.modules} modules!`)
              } catch (e) {
                alert('Failed: ' + e.message)
              }
            }}
            className="px-3 py-1.5 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600 transition-colors shrink-0"
          >
            Load Flashcards
          </button>
        </div>

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

        <p className="text-xs text-gray-500 mb-4">
          Showing {filteredCourses.length} of {courses.length} courses
        </p>

        {courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No courses yet</h3>
            <p className="text-gray-500 mb-6">Seed the course library to get started.</p>
            <button
              onClick={async () => {
                try {
                  await seedAllCourses()
                  window.location.reload()
                } catch (e) {
                  alert('Seed failed: ' + e.message)
                }
              }}
              className="px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-500 transition-colors"
            >
              Seed Course Library
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No courses match your filters</h3>
            <p className="text-gray-500">Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  )
}

export default Dashboard
