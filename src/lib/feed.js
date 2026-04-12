import { supabase } from './supabase'
import { notifyReply, notifyReaction } from './notifications'

export async function getFeedPosts(limit = 30, before = null) {
  let query = supabase.from('feed_posts').select('*')
    .is('parent_id', null).eq('is_deleted', false)
    .order('is_pinned', { ascending: false }).order('created_at', { ascending: false })
    .limit(limit)
  if (before) query = query.lt('created_at', before)
  const { data } = await query
  if (!data) return []

  const userIds = [...new Set(data.map((p) => p.user_id))]
  const profiles = {}
  for (const uid of userIds) {
    const { data: pr } = await supabase.from('user_profiles').select('display_name, location, experience_level').eq('user_id', uid).limit(1)
    profiles[uid] = pr?.[0] || { display_name: 'Unknown' }
  }
  return data.map((p) => ({ ...p, userProfile: profiles[p.user_id] }))
}

export async function getReplies(parentId) {
  const { data } = await supabase.from('feed_posts').select('*')
    .eq('parent_id', parentId).eq('is_deleted', false)
    .order('created_at', { ascending: true })
  if (!data) return []

  const userIds = [...new Set(data.map((p) => p.user_id))]
  const profiles = {}
  for (const uid of userIds) {
    const { data: pr } = await supabase.from('user_profiles').select('display_name, location').eq('user_id', uid).limit(1)
    profiles[uid] = pr?.[0] || { display_name: 'Unknown' }
  }
  return data.map((p) => ({ ...p, userProfile: profiles[p.user_id] }))
}

export async function createPost(userId, type, content, relatedCourse = null, relatedModule = null, imageUrl = null, imageType = null) {
  const trimmed = content.trim()
  if (!trimmed || trimmed.length > 1000) return null

  const key = 'hgdev-feed-timestamps'
  try {
    const stamps = JSON.parse(localStorage.getItem(key) || '[]')
    const hourAgo = Date.now() - 3600000
    const recent = stamps.filter((t) => t > hourAgo)
    if (recent.length >= 10) return { error: 'rate_limited' }
    recent.push(Date.now())
    localStorage.setItem(key, JSON.stringify(recent))
  } catch {}

  const insert = { user_id: userId, type, content: trimmed, related_course: relatedCourse, related_module: relatedModule }
  if (imageUrl) { insert.image_url = imageUrl; insert.image_type = imageType }

  const { data, error } = await supabase.from('feed_posts').insert(insert).select().single()
  if (error) return null
  return data
}

export async function createReply(userId, parentId, content) {
  const trimmed = content.trim()
  if (!trimmed || trimmed.length > 500) return null

  const { data, error } = await supabase.from('feed_posts').insert({
    user_id: userId, type: 'reply', content: trimmed, parent_id: parentId,
  }).select().single()
  if (error) return null

  // Increment reply count + notify post owner
  const { data: parent } = await supabase.from('feed_posts').select('reply_count, user_id').eq('id', parentId).single()
  await supabase.from('feed_posts').update({ reply_count: (parent?.reply_count || 0) + 1 }).eq('id', parentId)
  if (parent?.user_id) notifyReply(parent.user_id, userId, parentId, trimmed).catch(() => {})
  return data
}

export async function toggleReaction(postId, userId, emoji) {
  const { data: post } = await supabase.from('feed_posts').select('emoji_reactions, user_id').eq('id', postId).single()
  if (!post) return null

  const reactions = post.emoji_reactions || {}
  const users = reactions[emoji] || []
  const adding = !users.includes(userId)
  if (adding) {
    reactions[emoji] = [...users, userId]
  } else {
    reactions[emoji] = users.filter((u) => u !== userId)
    if (reactions[emoji].length === 0) delete reactions[emoji]
  }

  await supabase.from('feed_posts').update({ emoji_reactions: reactions }).eq('id', postId)
  if (adding && post.user_id) notifyReaction(post.user_id, userId, postId, emoji).catch(() => {})
  return reactions
}

export async function deletePost(postId, userId) {
  const { data } = await supabase.from('feed_posts').select('user_id').eq('id', postId).single()
  if (!data || data.user_id !== userId) return false
  await supabase.from('feed_posts').update({ is_deleted: true }).eq('id', postId)
  return true
}

export async function deleteReply(replyId, userId, parentId) {
  const { data } = await supabase.from('feed_posts').select('user_id, parent_id').eq('id', replyId).single()
  if (!data || data.user_id !== userId) return false
  await supabase.from('feed_posts').update({ is_deleted: true }).eq('id', replyId)
  // Decrement reply count on parent
  const { data: parent } = await supabase.from('feed_posts').select('reply_count').eq('id', parentId).single()
  if (parent) {
    await supabase.from('feed_posts').update({ reply_count: Math.max(0, (parent.reply_count || 1) - 1) }).eq('id', parentId)
  }
  return true
}

export function subscribeToFeed(callback) {
  return supabase.channel('feed')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'feed_posts' }, (p) => callback(p))
    .subscribe()
}
