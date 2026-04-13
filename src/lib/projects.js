import { supabase } from './supabase'

export async function getProjects() {
  const { data } = await supabase
    .from('community_projects')
    .select('*')
    .eq('status', 'active')
    .order('member_count', { ascending: false })
  return data || []
}

export async function getProject(slug) {
  const { data } = await supabase.from('community_projects').select('*').eq('slug', slug).single()
  return data
}

export async function getMyProjects(userId) {
  const { data: memberships } = await supabase
    .from('project_members')
    .select('*, community_projects(*)')
    .eq('user_id', userId)
  if (!memberships) return []
  return memberships
    .filter((m) => m.community_projects && m.community_projects.status === 'active')
    .map((m) => ({ ...m.community_projects, membership: m }))
}

export async function createProject(name, slug, description, githubUrl, tags, userId) {
  const insert = {
    name,
    slug,
    description,
    founder_id: userId,
    tags: tags || [],
    member_count: 1,
  }
  if (githubUrl) {
    insert.github_url = githubUrl
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (match) {
      insert.github_owner = match[1]
      insert.github_repo = match[2].replace(/\.git$/, '')
    }
  }
  const { data, error } = await supabase.from('community_projects').insert(insert).select().single()
  if (error) return { error: error.message }
  await supabase.from('project_members').insert({ project_id: data.id, user_id: userId, role: 'founder' })
  return { data }
}

export async function updateProject(projectId, userId, updates) {
  const { data: proj } = await supabase.from('community_projects').select('founder_id').eq('id', projectId).single()
  if (!proj || proj.founder_id !== userId) return { error: 'Only the founder can edit this project' }
  const allowed = {}
  if (updates.name !== undefined) allowed.name = updates.name
  if (updates.description !== undefined) allowed.description = updates.description
  if (updates.github_url !== undefined) {
    allowed.github_url = updates.github_url
    const match = updates.github_url?.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (match) {
      allowed.github_owner = match[1]
      allowed.github_repo = match[2].replace(/\.git$/, '')
    } else {
      allowed.github_owner = null
      allowed.github_repo = null
    }
  }
  if (updates.tags !== undefined) allowed.tags = updates.tags
  if (updates.status !== undefined) allowed.status = updates.status
  allowed.updated_at = new Date().toISOString()
  const { error } = await supabase.from('community_projects').update(allowed).eq('id', projectId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteProject(projectId, userId) {
  const { data: proj } = await supabase.from('community_projects').select('founder_id').eq('id', projectId).single()
  if (!proj || proj.founder_id !== userId) return { error: 'Only the founder can delete this project' }
  // Delete members, tasks, comments first (cascade should handle it, but be safe)
  await supabase.from('project_comments').delete().eq('project_id', projectId)
  await supabase.from('project_tasks').delete().eq('project_id', projectId)
  await supabase.from('project_members').delete().eq('project_id', projectId)
  const { error } = await supabase.from('community_projects').delete().eq('id', projectId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function hasCompletedBeginnerCourses(userId) {
  // Get all beginner courses
  const { data: courses } = await supabase.from('courses').select('id').eq('difficulty', 'beginner')
  if (!courses || courses.length === 0) return true // No beginner courses = no gate

  for (const course of courses) {
    // Get all modules for this course
    const { data: modules } = await supabase.from('modules').select('id').eq('course_id', course.id)
    if (!modules || modules.length === 0) continue

    // Get all lessons for these modules
    const moduleIds = modules.map((m) => m.id)
    const { data: lessons } = await supabase.from('lessons').select('id').in('module_id', moduleIds)
    if (!lessons || lessons.length === 0) continue

    // Check progress
    const lessonIds = lessons.map((l) => l.id)
    const { count } = await supabase
      .from('progress')
      .select('id', { count: 'exact', head: true })
      .in('lesson_id', lessonIds)
      .eq('user_id', userId)
      .eq('status', 'complete')

    if ((count || 0) < lessons.length) return false
  }
  return true
}

export async function joinProject(projectId, userId) {
  const { data, error } = await supabase
    .from('project_members')
    .insert({ project_id: projectId, user_id: userId })
    .select()
    .single()
  if (error) return null
  // Increment member count
  const { data: proj } = await supabase.from('community_projects').select('member_count').eq('id', projectId).single()
  await supabase.from('community_projects').update({ member_count: (proj?.member_count || 0) + 1 }).eq('id', projectId)
  return data
}

export async function leaveProject(projectId, userId) {
  const { data: membership } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single()
  if (membership?.role === 'founder') return { error: 'Founder cannot leave the project' }
  await supabase.from('project_members').delete().eq('project_id', projectId).eq('user_id', userId)
  const { data: proj } = await supabase.from('community_projects').select('member_count').eq('id', projectId).single()
  await supabase.from('community_projects').update({ member_count: Math.max(0, (proj?.member_count || 1) - 1) }).eq('id', projectId)
  return { success: true }
}

export async function getProjectMembers(projectId) {
  const { data } = await supabase.from('project_members').select('*').eq('project_id', projectId)
  if (!data) return []
  const enriched = []
  for (const m of data) {
    const { data: profile } = await supabase.from('user_profiles').select('display_name, location').eq('user_id', m.user_id).limit(1)
    enriched.push({ ...m, profile: profile?.[0] || { display_name: 'Unknown' } })
  }
  const roleOrder = { founder: 0, admin: 1, member: 2 }
  return enriched.sort((a, b) => (roleOrder[a.role] || 2) - (roleOrder[b.role] || 2))
}

export async function fetchGitHubInfo(owner, repo, projectId) {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
    if (!res.ok) return null
    const gh = await res.json()
    const updates = {
      github_description: gh.description || '',
      github_stars: gh.stargazers_count || 0,
      github_forks: gh.forks_count || 0,
      github_language: gh.language || '',
      github_open_issues: gh.open_issues_count || 0,
      github_last_synced_at: new Date().toISOString(),
    }
    await supabase.from('community_projects').update(updates).eq('id', projectId)
    return updates
  } catch {
    return null
  }
}

// --- Tasks ---

export async function getProjectTasks(projectId) {
  const { data } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })
  if (!data) return []
  // Enrich with assignee names
  const userIds = [...new Set(data.filter((t) => t.assigned_to).map((t) => t.assigned_to))]
  const profiles = {}
  for (const uid of userIds) {
    const { data: p } = await supabase.from('user_profiles').select('display_name').eq('user_id', uid).limit(1)
    profiles[uid] = p?.[0]?.display_name || 'Unknown'
  }
  return data.map((t) => ({ ...t, assigneeName: t.assigned_to ? profiles[t.assigned_to] || 'Unknown' : null }))
}

export async function createTask(projectId, title, description, priority, createdBy) {
  const { data, error } = await supabase
    .from('project_tasks')
    .insert({ project_id: projectId, title, description, priority: priority || 'medium', created_by: createdBy })
    .select()
    .single()
  if (error) return null
  return data
}

export async function updateTask(taskId, updates) {
  updates.updated_at = new Date().toISOString()
  const { error } = await supabase.from('project_tasks').update(updates).eq('id', taskId)
  return !error
}

export async function deleteTask(taskId) {
  const { error } = await supabase.from('project_tasks').delete().eq('id', taskId)
  return !error
}

export async function assignTask(taskId, assignedTo) {
  return updateTask(taskId, { assigned_to: assignedTo || null })
}

// --- Comments ---

export async function getProjectComments(projectId) {
  const { data: comments } = await supabase
    .from('project_comments')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })
  if (!comments) return []
  const senderIds = [...new Set(comments.map((c) => c.user_id))]
  const profiles = {}
  for (const sid of senderIds) {
    const { data: p } = await supabase.from('user_profiles').select('display_name, location').eq('user_id', sid).limit(1)
    profiles[sid] = p?.[0] || { display_name: 'Unknown' }
  }
  return comments.map((c) => ({ ...c, senderProfile: profiles[c.user_id] }))
}

export async function addProjectComment(projectId, userId, content, mediaUrl = null, mediaType = null) {
  const trimmed = content.trim()
  if (!trimmed && !mediaUrl) return null
  const insert = { project_id: projectId, user_id: userId, content: trimmed }
  if (mediaUrl) insert.media_url = mediaUrl
  if (mediaType) insert.media_type = mediaType
  const { data, error } = await supabase.from('project_comments').insert(insert).select().single()
  if (error) return null
  return data
}

export async function deleteProjectComment(commentId, userId, founderId) {
  const { data: comment } = await supabase.from('project_comments').select('user_id').eq('id', commentId).single()
  if (!comment) return false
  if (comment.user_id !== userId && userId !== founderId) return false
  await supabase.from('project_comments').update({ is_deleted: true }).eq('id', commentId)
  return true
}

export function subscribeToProjectComments(projectId, callback) {
  return supabase
    .channel(`proj-comments:${projectId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'project_comments', filter: `project_id=eq.${projectId}` }, (p) => callback(p.new))
    .subscribe()
}

// --- Polls ---

export async function getProjectPolls(projectId) {
  const { data: polls } = await supabase
    .from('project_polls')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  if (!polls) return []

  // Get vote counts and user profiles for each poll
  const enriched = []
  for (const poll of polls) {
    const { data: votes } = await supabase.from('project_poll_votes').select('*').eq('poll_id', poll.id)
    const voteCounts = {}
    poll.options.forEach((_, i) => { voteCounts[i] = 0 })
    const voters = {}
    for (const v of votes || []) {
      voteCounts[v.option_index] = (voteCounts[v.option_index] || 0) + 1
      voters[v.user_id] = v.option_index
    }
    // Get creator profile
    const { data: profile } = await supabase.from('user_profiles').select('display_name').eq('user_id', poll.created_by).limit(1)
    enriched.push({
      ...poll,
      voteCounts,
      totalVotes: (votes || []).length,
      voters,
      creatorName: profile?.[0]?.display_name || 'Unknown',
    })
  }
  return enriched
}

export async function createPoll(projectId, userId, question, options) {
  if (!question.trim() || options.length < 2) return null
  const { data, error } = await supabase.from('project_polls').insert({
    project_id: projectId,
    created_by: userId,
    question: question.trim(),
    options: options.map((o) => o.trim()).filter(Boolean),
  }).select().single()
  if (error) return null
  return data
}

export async function votePoll(pollId, userId, optionIndex) {
  // Upsert: change vote if already voted
  const { data: existing } = await supabase
    .from('project_poll_votes')
    .select('id')
    .eq('poll_id', pollId)
    .eq('user_id', userId)
    .limit(1)
  if (existing && existing.length > 0) {
    await supabase.from('project_poll_votes').update({ option_index: optionIndex }).eq('id', existing[0].id)
  } else {
    await supabase.from('project_poll_votes').insert({ poll_id: pollId, user_id: userId, option_index: optionIndex })
  }
  return true
}

export async function closePoll(pollId, userId) {
  const { data: poll } = await supabase.from('project_polls').select('created_by').eq('id', pollId).single()
  if (!poll || poll.created_by !== userId) return false
  await supabase.from('project_polls').update({ is_closed: true }).eq('id', pollId)
  return true
}

export async function deletePoll(pollId, userId) {
  const { data: poll } = await supabase.from('project_polls').select('created_by').eq('id', pollId).single()
  if (!poll || poll.created_by !== userId) return false
  await supabase.from('project_poll_votes').delete().eq('poll_id', pollId)
  await supabase.from('project_polls').delete().eq('id', pollId)
  return true
}

// --- Seed ---

export async function seedHGDevProject(userId) {
  const { data: existing } = await supabase.from('community_projects').select('id').eq('slug', 'hgdev').limit(1)
  if (existing && existing.length > 0) return
  const { data } = await supabase.from('community_projects').insert({
    name: 'HGDev',
    slug: 'hgdev',
    description: 'The HGDev learning platform — a community-driven project for developers in Southern Louisiana. Built with React, Supabase, and Tailwind CSS.',
    founder_id: userId,
    github_url: 'https://github.com/WStra/HGDev',
    github_owner: 'WStra',
    github_repo: 'HGDev',
    status: 'active',
    tags: ['react', 'supabase', 'tailwind', 'education', 'community'],
    member_count: 1,
  }).select().single()
  if (data) {
    await supabase.from('project_members').insert({ project_id: data.id, user_id: userId, role: 'founder' })
  }
}
