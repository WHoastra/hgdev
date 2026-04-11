import { supabase } from './supabase'

const LA_PARISHES = ['Terrebonne','Lafourche','St. Mary','Iberia','Lafayette','Calcasieu','Assumption','Vermilion','Acadia','St. Landry','St. Martin','Plaquemines','St. Bernard','St. Charles','St. James','St. John the Baptist','Jefferson','Orleans','East Baton Rouge','Ascension','Tangipahoa','St. Tammany']

async function fetchUserData(userId) {
  const [progress, quizAttempts, fcProgress, profile, feedPosts, messages, channelMembers, certs, coachConvos] = await Promise.all([
    supabase.from('progress').select('*').eq('user_id', userId),
    supabase.from('quiz_attempts').select('*').eq('user_id', userId).order('completed_at', { ascending: false }),
    supabase.from('flashcard_progress').select('*').eq('user_id', userId),
    supabase.from('user_profiles').select('*').eq('user_id', userId).limit(1),
    supabase.from('feed_posts').select('id, type, parent_id, emoji_reactions').eq('user_id', userId).eq('is_deleted', false),
    supabase.from('messages').select('id').eq('sender_id', userId).limit(1),
    supabase.from('channel_members').select('id').eq('user_id', userId),
    supabase.from('certificates').select('*, courses(difficulty)').eq('user_id', userId),
    supabase.from('coach_conversations').select('context_type, context_id').eq('user_id', userId).eq('context_type', 'lesson'),
  ])

  const completeLessons = (progress.data || []).filter((p) => p.status === 'complete')
  const allLessons = await supabase.from('lessons').select('id, module_id')
  const allModules = await supabase.from('modules').select('id, course_id')
  const allCourses = await supabase.from('courses').select('id, difficulty')

  return {
    completeLessons,
    allProgress: progress.data || [],
    quizAttempts: quizAttempts.data || [],
    fcProgress: fcProgress.data || [],
    profile: profile.data?.[0] || null,
    feedPosts: feedPosts.data || [],
    messages: messages.data || [],
    channelMembers: channelMembers.data || [],
    certs: certs.data || [],
    coachConvos: coachConvos.data || [],
    allLessons: allLessons.data || [],
    allModules: allModules.data || [],
    allCourses: allCourses.data || [],
  }
}

function getCompleteLessonsByModule(d) {
  const moduleMap = {}
  for (const m of d.allModules) moduleMap[m.id] = { courseId: m.course_id, lessonIds: [] }
  for (const l of d.allLessons) if (moduleMap[l.module_id]) moduleMap[l.module_id].lessonIds.push(l.id)
  const completeIds = new Set(d.completeLessons.map((p) => p.lesson_id))
  const result = {}
  for (const [modId, info] of Object.entries(moduleMap)) {
    result[modId] = { ...info, total: info.lessonIds.length, complete: info.lessonIds.filter((id) => completeIds.has(id)).length }
  }
  return result
}

function getStreakDays(d) {
  const dates = new Set()
  for (const p of d.allProgress) {
    if (p.completed_at) dates.add(new Date(p.completed_at).toDateString())
    if (p.updated_at) dates.add(new Date(p.updated_at).toDateString())
  }
  for (const q of d.quizAttempts) if (q.completed_at) dates.add(new Date(q.completed_at).toDateString())

  let streak = 0
  const today = new Date()
  const check = new Date(today)
  while (true) {
    if (dates.has(check.toDateString())) { streak++; check.setDate(check.getDate() - 1) }
    else if (streak === 0) { check.setDate(check.getDate() - 1); if (dates.has(check.toDateString())) { streak++; check.setDate(check.getDate() - 1) } else break }
    else break
  }
  return streak
}

const CHECKS = {
  first_step: (d) => d.completeLessons.length >= 1,
  getting_started: (d) => { const m = getCompleteLessonsByModule(d); return Object.values(m).some((v) => v.total > 0 && v.complete >= v.total) },
  course_graduate: (d) => {
    const m = getCompleteLessonsByModule(d)
    const courseComplete = {}
    for (const mod of Object.values(m)) { if (!courseComplete[mod.courseId]) courseComplete[mod.courseId] = { total: 0, complete: 0 }; courseComplete[mod.courseId].total += mod.total; courseComplete[mod.courseId].complete += mod.complete }
    return Object.values(courseComplete).some((c) => c.total > 0 && c.complete >= c.total)
  },
  curriculum_master: (d) => {
    const m = getCompleteLessonsByModule(d)
    const courseComplete = {}
    for (const mod of Object.values(m)) { if (!courseComplete[mod.courseId]) courseComplete[mod.courseId] = { total: 0, complete: 0 }; courseComplete[mod.courseId].total += mod.total; courseComplete[mod.courseId].complete += mod.complete }
    return Object.values(courseComplete).length > 0 && Object.values(courseComplete).every((c) => c.total > 0 && c.complete >= c.total)
  },
  perfect_score: (d) => d.quizAttempts.some((q) => q.percentage === 100),
  quiz_streak: (d) => d.quizAttempts.length >= 3 && d.quizAttempts.slice(0, 3).every((q) => q.percentage === 100),
  flashcard_scholar: (d) => {
    const byModule = {}
    for (const fc of d.fcProgress) { const mod = fc.module_id || 'unknown'; if (!byModule[mod]) byModule[mod] = []; byModule[mod].push(fc) }
    return Object.values(byModule).some((arr) => arr.length > 0 && arr.every((fc) => fc.comfort_level === 3))
  },
  halfway_there: (d) => d.allLessons.length > 0 && d.completeLessons.length / d.allLessons.length >= 0.5,
  ten_lessons: (d) => d.completeLessons.length >= 10,
  twenty_five_lessons: (d) => d.completeLessons.length >= 25,
  fifty_lessons: (d) => d.completeLessons.length >= 50,
  three_day_streak: (d) => getStreakDays(d) >= 3,
  week_warrior: (d) => getStreakDays(d) >= 7,
  monthly_machine: (d) => getStreakDays(d) >= 30,
  night_owl: (d) => d.completeLessons.some((p) => p.completed_at && new Date(p.completed_at).getHours() >= 22),
  early_bird: (d) => d.completeLessons.some((p) => p.completed_at && new Date(p.completed_at).getHours() < 7),
  deep_thinker: (d) => new Set(d.coachConvos.map((c) => c.context_id)).size >= 10,
  hello_world: (d) => d.feedPosts.some((p) => !p.parent_id),
  helping_hand: (d) => d.feedPosts.some((p) => p.parent_id),
  cheerleader: () => false, // Complex to check — skip for now
  connected: (d) => d.messages.length > 0,
  team_player: (d) => d.channelMembers.length >= 5,
  mentor_ready: (d) => d.profile?.open_to_mentor === true,
  all_set: (d) => d.profile?.profile_complete === true,
  skilled_up: (d) => (d.profile?.skills || []).length >= 10,
  homegrown: (d) => d.profile?.parish && LA_PARISHES.includes(d.profile.parish),
  pioneer: async (d, userId) => {
    const { data } = await supabase.from('user_profiles').select('user_id').order('created_at').limit(50)
    return (data || []).some((p) => p.user_id === userId)
  },
  certified: (d) => d.certs.length >= 1,
  full_stack_learner: (d) => {
    const diffs = new Set(d.certs.map((c) => c.course_difficulty || c.courses?.difficulty).filter(Boolean))
    return diffs.has('beginner') && diffs.has('intermediate') && diffs.has('advanced')
  },
  the_whole_bayou: (d) => {
    const m = getCompleteLessonsByModule(d)
    const allComplete = Object.values(m).length > 0 && Object.values(m).every((v) => v.total > 0 && v.complete >= v.total)
    return allComplete && d.quizAttempts.length > 0 && d.fcProgress.length > 0 && d.fcProgress.every((f) => f.comfort_level === 3)
  },
}

export async function checkAllBadges(userId) {
  const { data: allDefs } = await supabase.from('badge_definitions').select('*').order('sort_order')
  const { data: earned } = await supabase.from('user_badges').select('badge_id').eq('user_id', userId)
  const earnedIds = new Set((earned || []).map((b) => b.badge_id))

  const d = await fetchUserData(userId)
  const newBadges = []

  for (const def of allDefs || []) {
    if (earnedIds.has(def.id)) continue
    const check = CHECKS[def.id]
    if (!check) continue

    let passed = false
    try {
      const result = check(d, userId)
      passed = result instanceof Promise ? await result : result
    } catch {}

    if (passed) {
      const awarded = await awardBadge(userId, def.id)
      if (awarded) newBadges.push(def)
    }
  }

  return newBadges
}

export async function awardBadge(userId, badgeId) {
  const { error } = await supabase.from('user_badges').insert({ user_id: userId, badge_id: badgeId })
  return !error
}

export async function getUserBadges(userId) {
  const { data } = await supabase
    .from('user_badges')
    .select('*, badge_definitions(*)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })
  return (data || []).map((ub) => ({ ...ub.badge_definitions, earned_at: ub.earned_at }))
}

export async function getAllBadgeDefinitions() {
  const { data } = await supabase.from('badge_definitions').select('*').order('sort_order')
  return data || []
}
