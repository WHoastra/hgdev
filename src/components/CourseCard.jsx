import { useNavigate } from 'react-router-dom'
import ProgressBar from './ProgressBar'

const difficultyColors = {
  beginner: 'bg-green-900 text-green-300',
  intermediate: 'bg-yellow-900 text-yellow-300',
  advanced: 'bg-red-900 text-red-300',
}

function CourseCard({ course, progress }) {
  const navigate = useNavigate()
  const { completedLessons, totalLessons, percentage } = progress

  return (
    <div
      onClick={() => navigate(`/course/${course.id}`)}
      className="bg-[#1e293b] rounded-lg border border-gray-700 p-5 cursor-pointer
        hover:border-green-500/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/5
        transition-all duration-200"
    >
      <div className="flex items-center gap-2 mb-3">
        {course.category && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
            {course.category}
          </span>
        )}
        {course.difficulty && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[course.difficulty] || 'bg-gray-700 text-gray-300'}`}
          >
            {course.difficulty}
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>

      {course.description && (
        <p className="text-sm text-gray-400 mb-4 line-clamp-3">
          {course.description}
        </p>
      )}

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <ProgressBar percentage={percentage} />
        </div>
        <p className="text-xs text-gray-500 shrink-0">
          {completedLessons}/{totalLessons} lessons
        </p>
      </div>
    </div>
  )
}

export default CourseCard
