import { supabase } from './supabase'

export async function getChannels() {
  const { data } = await supabase.from('channels').select('*').eq('is_archived', false).order('category').order('name')
  return data || []
}

export async function getMyChannels(userId) {
  const { data: memberships } = await supabase.from('channel_members').select('*, channels(*)').eq('user_id', userId)
  if (!memberships) return []

  const results = []
  for (const m of memberships) {
    if (!m.channels || m.channels.is_archived) continue
    const { count } = await supabase
      .from('channel_messages')
      .select('id', { count: 'exact', head: true })
      .eq('channel_id', m.channel_id)
      .eq('is_deleted', false)
      .gt('created_at', m.last_read_at || '1970-01-01')
    results.push({ ...m.channels, membership: m, unreadCount: count || 0 })
  }
  return results.sort((a, b) => (b.updated_at || '') > (a.updated_at || '') ? 1 : -1)
}

export async function getChannel(slug) {
  const { data } = await supabase.from('channels').select('*').eq('slug', slug).single()
  return data
}

export async function getChannelMembers(channelId) {
  const { data } = await supabase.from('channel_members').select('*').eq('channel_id', channelId)
  if (!data) return []
  const enriched = []
  for (const m of data) {
    const { data: profile } = await supabase.from('user_profiles').select('display_name, location').eq('user_id', m.user_id).limit(1)
    enriched.push({ ...m, profile: profile?.[0] || { display_name: 'Unknown' } })
  }
  const roleOrder = { admin: 0, moderator: 1, member: 2 }
  return enriched.sort((a, b) => (roleOrder[a.role] || 2) - (roleOrder[b.role] || 2) || (a.profile.display_name || '').localeCompare(b.profile.display_name || ''))
}

export async function joinChannel(channelId, userId) {
  const { data, error } = await supabase.from('channel_members').insert({ channel_id: channelId, user_id: userId }).select().single()
  if (error) return null
  await supabase.rpc('increment_member_count', { cid: channelId }).catch(() => {
    // Fallback if RPC doesn't exist
    supabase.from('channels').select('member_count').eq('id', channelId).single().then(({ data: ch }) => {
      supabase.from('channels').update({ member_count: (ch?.member_count || 0) + 1 }).eq('id', channelId)
    })
  })
  return data
}

export async function leaveChannel(channelId, userId) {
  const { data: ch } = await supabase.from('channels').select('is_default').eq('id', channelId).single()
  if (ch?.is_default) return { error: 'Cannot leave default channels' }
  await supabase.from('channel_members').delete().eq('channel_id', channelId).eq('user_id', userId)
  const { data: countData } = await supabase.from('channels').select('member_count').eq('id', channelId).single()
  await supabase.from('channels').update({ member_count: Math.max(0, (countData?.member_count || 1) - 1) }).eq('id', channelId)
  return { success: true }
}

export async function getChannelMessages(channelId, limit = 50, before = null) {
  let query = supabase.from('channel_messages').select('*').eq('channel_id', channelId).eq('is_deleted', false).order('created_at', { ascending: true }).limit(limit)
  if (before) query = query.lt('created_at', before)
  const { data: msgs } = await query
  if (!msgs) return []

  // Enrich with sender profiles and reply content
  const senderIds = [...new Set(msgs.map((m) => m.sender_id))]
  const profiles = {}
  for (const sid of senderIds) {
    const { data: p } = await supabase.from('user_profiles').select('display_name, location').eq('user_id', sid).limit(1)
    profiles[sid] = p?.[0] || { display_name: 'Unknown' }
  }

  const replyIds = msgs.filter((m) => m.reply_to_id).map((m) => m.reply_to_id)
  const replies = {}
  if (replyIds.length > 0) {
    const { data: replyMsgs } = await supabase.from('channel_messages').select('id, sender_id, content').in('id', replyIds)
    for (const r of replyMsgs || []) {
      replies[r.id] = { ...r, senderName: profiles[r.sender_id]?.display_name || 'Unknown' }
    }
  }

  return msgs.map((m) => ({ ...m, senderProfile: profiles[m.sender_id], replyTo: replies[m.reply_to_id] || null }))
}

export async function sendChannelMessage(channelId, senderId, content, replyToId = null, imageUrl = null, imageType = null) {
  const trimmed = content.trim()
  if (!trimmed && !imageUrl) return null
  if (trimmed.length > 2000) return null

  // Rate limit: 30 messages per 10 minutes per channel
  const key = `hgdev-ch-${channelId}`
  try {
    const stamps = JSON.parse(localStorage.getItem(key) || '[]')
    const tenMinAgo = Date.now() - 600000
    const recent = stamps.filter((t) => t > tenMinAgo)
    if (recent.length >= 30) return { error: 'rate_limited' }
    recent.push(Date.now())
    localStorage.setItem(key, JSON.stringify(recent))
  } catch {}

  const insert = { channel_id: channelId, sender_id: senderId, content: trimmed }
  if (replyToId) insert.reply_to_id = replyToId
  if (imageUrl) insert.image_url = imageUrl
  if (imageType) insert.image_type = imageType
  const { data, error } = await supabase.from('channel_messages').insert(insert).select().single()
  if (error) return null
  await supabase.from('channels').update({ updated_at: new Date().toISOString() }).eq('id', channelId)
  return data
}

export async function deleteChannelMessage(messageId, userId, userRole) {
  const { data: msg } = await supabase.from('channel_messages').select('sender_id').eq('id', messageId).single()
  if (!msg) return false
  if (msg.sender_id !== userId && userRole !== 'admin' && userRole !== 'moderator') return false
  await supabase.from('channel_messages').update({ is_deleted: true }).eq('id', messageId)
  return true
}

export async function editChannelMessage(messageId, userId, newContent) {
  const trimmed = newContent.trim()
  if (!trimmed || trimmed.length > 2000) return false
  const { data: msg } = await supabase.from('channel_messages').select('sender_id').eq('id', messageId).single()
  if (!msg || msg.sender_id !== userId) return false
  const { error } = await supabase.from('channel_messages').update({ content: trimmed, edited_at: new Date().toISOString() }).eq('id', messageId)
  return !error
}

export async function deleteAllChannelMessages(channelId, userId, userRole) {
  if (userRole !== 'admin') return false
  const { error } = await supabase.from('channel_messages').update({ is_deleted: true }).eq('channel_id', channelId).eq('is_deleted', false)
  return !error
}

export async function updateLastRead(channelId, userId) {
  await supabase.from('channel_members').update({ last_read_at: new Date().toISOString() }).eq('channel_id', channelId).eq('user_id', userId)
}

export function subscribeToChannelMessages(channelId, callback) {
  return supabase.channel(`ch-msg:${channelId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'channel_messages', filter: `channel_id=eq.${channelId}` }, (p) => callback(p.new))
    .subscribe()
}

export async function reportChannelMessage(messageId, reportedBy, reason, details) {
  const { error } = await supabase.from('channel_message_reports').insert({ message_id: messageId, reported_by: reportedBy, reason, details })
  return !error
}

export async function autoJoinDefaults(userId) {
  const { data: defaults } = await supabase.from('channels').select('id').eq('is_default', true)
  for (const ch of defaults || []) {
    const { data: existing } = await supabase.from('channel_members').select('id').eq('channel_id', ch.id).eq('user_id', userId).limit(1)
    if (!existing || existing.length === 0) {
      await supabase.from('channel_members').insert({ channel_id: ch.id, user_id: userId })
      await supabase.from('channels').select('member_count').eq('id', ch.id).single().then(({ data: c }) => {
        supabase.from('channels').update({ member_count: (c?.member_count || 0) + 1 }).eq('id', ch.id)
      })
    }
  }
}

export async function createChannel(name, slug, description, category, icon, userId) {
  const { count } = await supabase.from('channels').select('id', { count: 'exact', head: true }).eq('created_by', userId)
  if ((count || 0) >= 3) return { error: 'limit' }
  const { data, error } = await supabase.from('channels').insert({
    name, slug, description, category, icon: icon || '💬', is_official: false, created_by: userId, member_count: 1,
  }).select().single()
  if (error) return { error: error.message }
  await supabase.from('channel_members').insert({ channel_id: data.id, user_id: userId, role: 'admin' })
  return { data }
}
