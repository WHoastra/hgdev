import { useNavigate } from 'react-router-dom'

function ProjectCard({ project, isMember, onJoin }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (isMember) navigate(`/projects/${project.slug}`)
  }

  return (
    <div
      onClick={handleClick}
      className={`bg-[#1e293b] rounded-xl border border-gray-700 p-6 transition-all duration-200 ${isMember ? 'cursor-pointer hover:-translate-y-1 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/5' : ''}`}
      style={{ borderLeftWidth: '4px', borderLeftColor: '#22c55e' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚀</span>
          <div>
            <h3 className="text-lg font-bold text-white">{project.name}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${project.status === 'active' ? 'bg-green-900/50 text-green-400' : project.status === 'completed' ? 'bg-blue-900/50 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
              {project.status}
            </span>
          </div>
        </div>
        <span className="text-xs text-gray-500">{project.member_count || 0} members</span>
      </div>

      {project.description && (
        <p className="text-sm text-gray-400 line-clamp-2 mb-4">{project.description}</p>
      )}

      {/* GitHub link */}
      {project.github_url && (
        <a href={project.github_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 mb-3 text-xs text-green-400 hover:text-green-300 transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" /></svg>
          <span className="truncate">{project.github_url}</span>
          <svg className="w-3 h-3 shrink-0 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>
      )}

      {/* GitHub stats */}
      {project.github_owner && (
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" /></svg>
            {project.github_stars || 0}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0zM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zM8 12.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z" /></svg>
            {project.github_forks || 0}
          </span>
          {project.github_language && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              {project.github_language}
            </span>
          )}
        </div>
      )}

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 bg-[#0f172a] text-gray-400 rounded-full border border-gray-700">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Action */}
      <div className="flex items-center justify-end">
        {isMember ? (
          <span className="text-xs text-green-400 font-medium">View Project →</span>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onJoin?.(project.id) }}
            className="px-4 py-1.5 text-xs font-medium text-green-400 border border-green-500/50 rounded-lg hover:bg-green-500/10 transition-colors"
          >
            Join Project
          </button>
        )}
      </div>
    </div>
  )
}

export default ProjectCard
