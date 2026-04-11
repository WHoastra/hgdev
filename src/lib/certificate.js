import { supabase } from './supabase'

export function generateCertificateNumber() {
  const year = new Date().getFullYear()
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const arr = new Uint8Array(6)
  crypto.getRandomValues(arr)
  const code = Array.from(arr).map((b) => chars[b % chars.length]).join('')
  return `HGDEV-${year}-${code}`
}

export async function checkAndCreateCertificate(userId, courseId) {
  // Check if certificate already exists
  const { data: existing } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .limit(1)

  if (existing && existing.length > 0) return existing[0]

  // Check if all lessons are complete
  const { data: course } = await supabase.from('courses').select('*').eq('id', courseId).single()
  if (!course) return null

  const { data: modules } = await supabase.from('modules').select('id').eq('course_id', courseId)
  if (!modules || modules.length === 0) return null

  const moduleIds = modules.map((m) => m.id)
  const { data: lessons } = await supabase.from('lessons').select('id').in('module_id', moduleIds)
  if (!lessons || lessons.length === 0) return null

  const lessonIds = lessons.map((l) => l.id)
  const { data: progress } = await supabase
    .from('progress')
    .select('id')
    .in('lesson_id', lessonIds)
    .eq('user_id', userId)
    .eq('status', 'complete')

  if (!progress || progress.length < lessons.length) return null

  // Get user profile
  const { data: profile } = await supabase.from('user_profiles').select('display_name').eq('user_id', userId).limit(1)
  const displayName = profile?.[0]?.display_name || 'HGDev Learner'

  // Create certificate
  const { data: cert, error } = await supabase.from('certificates').insert({
    user_id: userId,
    course_id: courseId,
    certificate_number: generateCertificateNumber(),
    recipient_name: displayName,
    course_title: course.title,
    course_category: course.category,
    course_difficulty: course.difficulty,
    total_lessons: lessons.length,
    total_modules: modules.length,
  }).select().single()

  if (error) return null
  return cert
}

export async function getCertificatesForUser(userId) {
  const { data } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false })
  return data || []
}

export async function getCertificateByNumber(certificateNumber) {
  const { data } = await supabase
    .from('certificates')
    .select('*')
    .eq('certificate_number', certificateNumber)
    .single()
  return data
}
