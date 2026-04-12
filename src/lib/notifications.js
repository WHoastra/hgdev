import { supabase } from './supabase'

export async function getNotifications(userId, limit = 30) {
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (!data) return []

  const senderIds = [...new Set(data.filter((n) => n.sender_id).map((n) => n.sender_id))]
  const profiles = {}
  for (const sid of senderIds) {
    const { data: p } = await supabase.from('user_profiles').select('display_name').eq('user_id', sid).limit(1)
    profiles[sid] = p?.[0]?.display_name || 'Someone'
  }

  return data.map((n) => ({ ...n, senderName: profiles[n.sender_id] || null }))
}

export async function getUnreadNotificationCount(userId) {
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)
  return count || 0
}

export async function markNotificationRead(notificationId) {
  await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId)
}

export async function markAllNotificationsRead(userId) {
  await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
}

export function subscribeToNotifications(userId, callback) {
  return supabase
    .channel(`notif:${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    }, (payload) => callback(payload.new))
    .subscribe()
}

// --- Notification creators (called from other modules) ---

export async function notifyReply(postOwnerId, senderId, postId, replyPreview) {
  if (postOwnerId === senderId) return
  await supabase.from('notifications').insert({
    user_id: postOwnerId,
    sender_id: senderId,
    type: 'reply',
    title: 'New reply on your post',
    body: replyPreview.slice(0, 100),
    link: '/community',
  })
}

export async function notifyReaction(postOwnerId, senderId, postId, emoji) {
  if (postOwnerId === senderId) return
  await supabase.from('notifications').insert({
    user_id: postOwnerId,
    sender_id: senderId,
    type: 'reaction',
    title: `Reacted ${emoji} to your post`,
    body: null,
    link: '/community',
  })
}

export async function notifyDM(recipientId, senderId, conversationId, messagePreview) {
  if (recipientId === senderId) return
  await supabase.from('notifications').insert({
    user_id: recipientId,
    sender_id: senderId,
    type: 'dm',
    title: 'New message',
    body: messagePreview.slice(0, 100),
    link: `/messages/${conversationId}`,
  })
}

export async function notifyChannelReply(originalSenderId, replySenderId, channelSlug, replyPreview) {
  if (originalSenderId === replySenderId) return
  await supabase.from('notifications').insert({
    user_id: originalSenderId,
    sender_id: replySenderId,
    type: 'channel_reply',
    title: 'Replied to your message',
    body: replyPreview.slice(0, 100),
    link: `/channels/${channelSlug}`,
  })
}
