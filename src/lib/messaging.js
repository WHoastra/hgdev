import { supabase } from './supabase'
import { notifyDM } from './notifications'

function normalizePair(a, b) {
  return a < b ? [a, b] : [b, a]
}

export async function getOrCreateConversation(currentUserId, otherUserId) {
  const [p1, p2] = normalizePair(currentUserId, otherUserId)
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('participant_one', p1)
    .eq('participant_two', p2)
    .limit(1)

  if (existing && existing.length > 0) return existing[0]

  const { data, error } = await supabase
    .from('conversations')
    .insert({ participant_one: p1, participant_two: p2 })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getConversations(userId) {
  const { data: convos } = await supabase
    .from('conversations')
    .select('*')
    .or(`participant_one.eq.${userId},participant_two.eq.${userId}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (!convos) return []

  const results = []
  for (const c of convos) {
    const otherId = c.participant_one === userId ? c.participant_two : c.participant_one
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name, location, experience_level')
      .eq('user_id', otherId)
      .limit(1)

    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', c.id)
      .neq('sender_id', userId)
      .eq('is_read', false)

    results.push({
      ...c,
      otherUserId: otherId,
      otherProfile: profile?.[0] || { display_name: 'Unknown', location: null, experience_level: null },
      unreadCount: count || 0,
    })
  }
  return results
}

export async function getMessages(conversationId, limit = 50, before = null) {
  let query = supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (before) query = query.lt('created_at', before)
  const { data } = await query
  return data || []
}

export async function sendMessage(conversationId, senderId, content) {
  const trimmed = content.trim()
  if (!trimmed || trimmed.length > 2000) return null

  // Rate limit: 60 messages per hour
  const key = 'hgdev-msg-timestamps'
  try {
    const stamps = JSON.parse(localStorage.getItem(key) || '[]')
    const hourAgo = Date.now() - 3600000
    const recent = stamps.filter((t) => t > hourAgo)
    if (recent.length >= 60) return { error: 'rate_limited' }
    recent.push(Date.now())
    localStorage.setItem(key, JSON.stringify(recent))
  } catch {}

  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content: trimmed })
    .select()
    .single()
  if (error) throw error

  await supabase.from('conversations').update({
    last_message_text: trimmed.slice(0, 100),
    last_message_at: new Date().toISOString(),
    last_message_by: senderId,
  }).eq('id', conversationId)

  // Notify the other participant
  const { data: convo } = await supabase.from('conversations').select('participant_one, participant_two').eq('id', conversationId).single()
  if (convo) {
    const recipientId = convo.participant_one === senderId ? convo.participant_two : convo.participant_one
    notifyDM(recipientId, senderId, conversationId, trimmed).catch(() => {})
  }

  return data
}

export async function markMessagesAsRead(conversationId, userId) {
  const { count } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('is_read', false)
    .select('id', { count: 'exact', head: true })
  return count || 0
}

export async function getUnreadCount(userId) {
  // Get all conversation IDs for this user
  const { data: convos } = await supabase
    .from('conversations')
    .select('id')
    .or(`participant_one.eq.${userId},participant_two.eq.${userId}`)

  if (!convos || convos.length === 0) return 0
  const ids = convos.map((c) => c.id)

  const { count } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .in('conversation_id', ids)
    .neq('sender_id', userId)
    .eq('is_read', false)
  return count || 0
}

export function subscribeToMessages(conversationId, callback) {
  return supabase
    .channel(`messages:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`,
    }, (payload) => callback(payload.new))
    .subscribe()
}

export function subscribeToAllMessages(userId, callback) {
  return supabase
    .channel(`inbox:${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
    }, (payload) => callback(payload.new))
    .subscribe()
}

export async function reportMessage(messageId, reportedBy, reason, details) {
  const { error } = await supabase.from('message_reports').insert({
    message_id: messageId, reported_by: reportedBy, reason, details,
  })
  return !error
}
