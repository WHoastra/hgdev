import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUserId } from '../lib/useUserId'
import { supabase } from '../lib/supabase'
import {
  getProject, getProjectMembers, getProjectTasks, getProjectComments,
  joinProject, leaveProject, fetchGitHubInfo,
  createTask, updateTask, deleteTask, assignTask,
  addProjectComment, deleteProjectComment, subscribeToProjectComments
} from '../lib/projects'
import TaskBoard from '../components/TaskBoard'
import ProjectComment from '../components/ProjectComment'
import ProjectMediaUpload from '../components/ProjectMediaUpload'

function Project() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { userId } = useUserId()
  const bottomRef = useRef()

  const [project, setProject] = useState(null)
  const [members, setMembers] = useState([])
  const [tasks, setTasks] = useState([])
  const [comments, setComments] = useState([])
  const [membership, setMembership] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [showMediaUpload, setShowMediaUpload] = useState(false)
  const [pendingMedia, setPendingMedia] = useState(null)
  const [sending, setSending] = useState(false)
  const [ghSyncing, setGhSyncing] = useState(false)

  const isFounder = project?.founder_id === userId
  const isMember = !!membership

  const fetchAll = async () => {
    if (!userId) return
    const p = await getProject(slug)
    if (!p) { setLoading(false); return }
    setProject(p)

    const [mems, tks, cms] = await Promise.all([
      getProjectMembers(p.id),
      getProjectTasks(p.id),
      getProjectComments(p.id),
    ])
    setMembers(mems)
    setTasks(tks)
    setComments(cms)
    setMembership(mems.find((m) => m.user_id === userId) || null)

    // Sync GitHub info if stale (>1 hour)
    if (p.github_owner && p.github_repo) {
      const synced = p.github_last_synced_at ? new Date(p.github_last_synced_at).getTime() : 0
      if (Date.now() - synced > 3600000) {
        const info = await fetchGitHubInfo(p.github_owner, p.github_repo, p.id)
        if (info) setProject((prev) => ({ ...prev, ...info }))
      }
    }

    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [slug, userId])

  // Real-time comments
  useEffect(() => {
    if (!project?.id) return
    const sub = subscribeToProjectComments(project.id, async (newComment) => {
      if (newComment.user_id === userId) return // Already added optimistically
      // Enrich with profile
      const { data: profile } = await supabase
        .from('user_profiles').select('display_name, location').eq('user_id', newComment.user_id).limit(1)
      setComments((prev) => [...prev, { ...newComment, senderProfile: profile?.[0] || { display_name: 'Unknown' } }])
    })
    return () => { sub.unsubscribe() }
  }, [project?.id, userId])

  // Auto-scroll on new comments
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments.length])

  const handleJoin = async () => {
    await joinProject(project.id, userId)
    fetchAll()
  }

  const handleLeave = async () => {
    const result = await leaveProject(project.id, userId)
    if (result?.error) return
    navigate('/channels')
  }

  const handleSyncGitHub = async () => {
    if (!project.github_owner) return
    setGhSyncing(true)
    const info = await fetchGitHubInfo(project.github_owner, project.github_repo, project.id)
    if (info) setProject((prev) => ({ ...prev, ...info }))
    setGhSyncing(false)
  }

  const handleCreateTask = async (title, desc, priority) => {
    const t = await createTask(project.id, title, desc, priority, userId)
    if (t) setTasks((prev) => [...prev, { ...t, assigneeName: null }])
  }

  const handleUpdateTask = async (taskId, updates) => {
    await updateTask(taskId, updates)
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, ...updates } : t))
  }

  const handleDeleteTask = async (taskId) => {
    await deleteTask(taskId)
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  const handleAssignTask = async (taskId, assignedTo) => {
    await assignTask(taskId, assignedTo)
    const member = members.find((m) => m.user_id === assignedTo)
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, assigned_to: assignedTo, assigneeName: member?.profile?.display_name || null } : t))
  }

  const handleSendComment = async () => {
    const text = commentText.trim()
    if (!text && !pendingMedia) return
    setSending(true)
    const result = await addProjectComment(
      project.id, userId, text || '',
      pendingMedia?.url || null,
      pendingMedia?.type || null
    )
    if (result) {
      // Optimistic add
      const me = members.find((m) => m.user_id === userId)
      setComments((prev) => [...prev, { ...result, senderProfile: me?.profile || { display_name: 'You' } }])
      setCommentText('')
      setPendingMedia(null)
      setShowMediaUpload(false)
    }
    setSending(false)
  }

  const handleDeleteComment = async (commentId) => {
    await deleteProjectComment(commentId, userId, project.founder_id)
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  const handleMediaUploaded = (url, type) => {
    setPendingMedia({ url, type })
    setShowMediaUpload(false)
  }

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  if (!project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-gray-400 mb-4">Project not found</p>
        <button onClick={() => navigate('/channels')} className="text-green-400 hover:text-green-300 text-sm">Back to Channels</button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/channels')} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${project.status === 'active' ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                {project.status}
              </span>
            </div>
            {project.description && <p className="text-sm text-gray-400 mt-1">{project.description}</p>}
          </div>
          {isMember && !isFounder && (
            <button onClick={handleLeave} className="px-3 py-1.5 text-xs text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors">Leave</button>
          )}
          {!isMember && (
            <button onClick={handleJoin} className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors">Join Project</button>
          )}
        </div>

        {/* GitHub Info Card */}
        {project.github_url && (
          <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" /></svg>
                <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-green-400 hover:text-green-300 font-medium transition-colors">
                  {project.github_owner}/{project.github_repo}
                </a>
              </div>
              <button onClick={handleSyncGitHub} disabled={ghSyncing}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50">
                {ghSyncing ? 'Syncing...' : 'Refresh'}
              </button>
            </div>
            {project.github_description && <p className="text-sm text-gray-400 mb-3">{project.github_description}</p>}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" /></svg>
                {project.github_stars || 0} stars
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0zM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zM8 12.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z" /></svg>
                {project.github_forks || 0} forks
              </span>
              {project.github_language && (
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  {project.github_language}
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={2} /><path strokeLinecap="round" d="M12 6v6l4 2" strokeWidth={2} /></svg>
                {project.github_open_issues || 0} open issues
              </span>
            </div>
          </div>
        )}

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Task Board */}
            {isMember && (
              <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-5">
                <TaskBoard
                  tasks={tasks}
                  members={members}
                  currentUserId={userId}
                  isFounder={isFounder}
                  onCreateTask={handleCreateTask}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  onAssignTask={handleAssignTask}
                />
              </div>
            )}

            {/* Comments Section */}
            <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-5">
              <h3 className="text-lg font-bold text-white mb-4">Discussion ({comments.length})</h3>

              {/* Comments list */}
              <div className="max-h-[500px] overflow-y-auto divide-y divide-gray-800">
                {comments.map((c) => (
                  <ProjectComment key={c.id} comment={c} currentUserId={userId} founderId={project.founder_id} onDelete={handleDeleteComment} />
                ))}
                {comments.length === 0 && (
                  <p className="text-gray-600 text-sm text-center py-8">No comments yet. Start the conversation!</p>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Comment input */}
              {isMember && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  {/* Pending media preview */}
                  {pendingMedia && (
                    <div className="mb-3 flex items-center gap-3 bg-[#0f172a] rounded-lg p-2">
                      {pendingMedia.type === 'video' ? (
                        <video src={pendingMedia.url} className="h-16 rounded" />
                      ) : (
                        <img src={pendingMedia.url} alt="" className="h-16 rounded object-cover" />
                      )}
                      <span className="text-xs text-gray-400 flex-1">Media attached</span>
                      <button onClick={() => setPendingMedia(null)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  )}

                  {showMediaUpload && (
                    <div className="mb-3">
                      <ProjectMediaUpload userId={userId} onUpload={handleMediaUploaded} onCancel={() => setShowMediaUpload(false)} />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => setShowMediaUpload(!showMediaUpload)}
                      className="px-3 py-2 text-gray-400 hover:text-green-400 transition-colors shrink-0" title="Attach media">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>
                    <input value={commentText} onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment() } }}
                      placeholder="Write a comment..."
                      className="flex-1 bg-[#0f172a] text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 placeholder-gray-600" />
                    <button onClick={handleSendComment} disabled={sending || (!commentText.trim() && !pendingMedia)}
                      className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50 transition-colors shrink-0">
                      {sending ? '...' : 'Send'}
                    </button>
                  </div>
                </div>
              )}

              {!isMember && (
                <div className="mt-4 pt-4 border-t border-gray-700 text-center">
                  <p className="text-gray-500 text-sm">Join this project to participate in the discussion</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Members */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-5 lg:sticky lg:top-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Members ({members.length})</h3>
              <div className="space-y-3">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-600/20 text-green-400 flex items-center justify-center text-xs font-bold shrink-0">
                      {(m.profile?.display_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{m.profile?.display_name || 'Unknown'}</p>
                      <div className="flex items-center gap-1">
                        {m.role === 'founder' && <span className="text-[10px] text-yellow-400">👑 Founder</span>}
                        {m.role === 'admin' && <span className="text-[10px] text-blue-400">Admin</span>}
                        {m.role === 'member' && <span className="text-[10px] text-gray-500">Member</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Project
