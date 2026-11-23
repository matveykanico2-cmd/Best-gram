import { create } from 'zustand'
import { api, getApiToken, setApiToken } from '../lib/api'

const normalizeMessage = (message) => ({
  ...message,
  conversationId: message.conversationId || message.chatId,
  timestamp: message.timestamp || message.createdAt,
})

export const useStore = create(
    (set, get) => ({
      activeUserId: null,
      isBootstrapping: true,
      authError: '',
      // Роль администратора должна дублироваться серверной проверкой после подключения backend.
      adminPhone: import.meta.env.VITE_ADMIN_PHONE || '+79781827502',
      donatePayUrl: import.meta.env.VITE_DONATEPAY_URL || 'https://donatepay.ru/',
      following: [],
      premiumUsers: [],
      users: [],
      tweets: [],
      notifications: [],
      conversations: [],
      messages: [],
      bookmarks: [],
      stories: [],
      communities: [],
      lists: [],

      isComposeModalOpen: false,

      // Actions
      setIsComposeModalOpen: (isOpen) => set({ isComposeModalOpen: isOpen }),
      
      login: async (identifier, password) => {
        try {
          const result = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) })
          setApiToken(result.token)
          set({ authError: '' })
          set({ activeUserId: result.user.id, isBootstrapping: true, users: [result.user], tweets: [], stories: [], conversations: [], messages: [], notifications: [], bookmarks: [], communities: [], lists: [], following: [] })
          await get().fetchInitialData()
          return true
        } catch (error) {
          set({ authError: error.message })
          return false
        }
      },

      register: async (name, handle, password, phone = '', birthDate = '') => {
        try {
          const result = await api('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, username: handle, password, phone, birthDate }) })
          setApiToken(result.token)
          set({ authError: '' })
          set({ activeUserId: result.user.id, isBootstrapping: true, users: [result.user], tweets: [], stories: [], conversations: [], messages: [], notifications: [], bookmarks: [], communities: [], lists: [], following: [] })
          await get().fetchInitialData()
          return true
        } catch (error) {
          set({ authError: error.message })
          return false
        }
      },

      resetPassword: async (username, phone, password) => {
        try { await api('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ username, phone, password }) }); return true } catch (error) { set({ authError: error.message }); return false }
      },

      logout: async () => {
        try { if (getApiToken()) await api('/api/auth/logout', { method: 'POST' }) } catch (error) { void error }
        setApiToken(null)
        set({ activeUserId: null, isBootstrapping: false, following: [], users: [], tweets: [], stories: [], conversations: [], messages: [], notifications: [], bookmarks: [], communities: [], lists: [] })
      },

      heartbeat: async () => { if (getApiToken()) { try { await api('/api/presence', { method: 'POST' }) } catch (error) { void error } } },

      isAdmin: () => {
        const user = get().users.find(u => u.id === get().activeUserId)
        return user?.role === 'admin' && user?.phone === get().adminPhone
      },

      resetLocalData: () => set({ activeUserId: null, following: [], premiumUsers: [], tweets: [], stories: [], notifications: [], conversations: [], messages: [], bookmarks: [] }),

      subscribe: async (plan = 'monthly') => {
        const activeUserId = get().activeUserId
        if (!activeUserId) return
        try { const result = await api('/api/subscriptions', { method: 'POST', body: JSON.stringify({ plan }) }); if (result.donatePayUrl) window.open(result.donatePayUrl, '_blank', 'noopener,noreferrer') } catch { return }
        set(state => ({ premiumUsers: [...new Set([...(state.premiumUsers || []), activeUserId])], users: state.users.map(user => user.id === activeUserId ? { ...user, premium: true, subscription: { plan, startedAt: new Date().toISOString() } } : user) }))
      },

      adminSetVerified: async (userId, verifiedType = 'blue') => {
        if (!get().isAdmin()) return false
        try { await api(`/api/admin/users/${userId}/verify`, { method: 'POST', body: JSON.stringify({ type: verifiedType }) }) } catch { return false }
        set(state => ({ users: state.users.map(user => user.id === userId ? { ...user, verified: true, verifiedType } : user) }))
        return true
      },

      adminRevokeVerified: async (userId) => {
        if (!get().isAdmin()) return false
        try { await api(`/api/admin/users/${userId}/verify`, { method: 'DELETE' }) } catch { return false }
        set(state => ({ users: state.users.map(user => user.id === userId ? { ...user, verified: false, verifiedType: null } : user) }))
        return true
      },

      adminDeleteTweet: async (tweetId) => {
        if (!get().isAdmin()) return false
        try { await api(`/api/admin/posts/${tweetId}`, { method: 'DELETE' }) } catch { return false }
        set(state => ({ tweets: state.tweets.filter(tweet => tweet.id !== tweetId) }))
        return true
      },

      toggleFollow: async (userId) => {
        try { await api(`/api/users/${userId}/follow`, { method: 'POST' }) } catch { return }
        set((state) => {
          const following = state.following || []
          const isFollowing = following.includes(userId)
          const newFollowing = isFollowing 
            ? following.filter(id => id !== userId)
            : [...following, userId]
          
          const newUsers = state.users.map(u => {
            const stats = { 
              following: 0, 
              followers: 0, 
              ...(u.stats || {}) 
            }
            
            if (u.id === state.activeUserId) {
              return { 
                ...u, 
                stats: { 
                  ...stats, 
                  following: Math.max(0, stats.following + (isFollowing ? -1 : 1))
                } 
              }
            }
            if (u.id === userId) {
              return { 
                ...u, 
                stats: { 
                  ...stats, 
                  followers: Math.max(0, stats.followers + (isFollowing ? -1 : 1))
                } 
              }
            }
            return u
          })

          return { 
            following: newFollowing,
            users: newUsers
          }
        })
      },

      blockUser: async (userId) => {
        try { const result = await api(`/api/users/${userId}/block`, { method: 'POST' }); set(state => ({ following: result.blocked ? state.following.filter(id => id !== userId) : state.following })); return result.blocked } catch { return false }
      },

      reportUser: async (userId, reason = 'Нарушение правил') => {
        try { await api('/api/reports', { method: 'POST', body: JSON.stringify({ targetType: 'user', targetId: userId, reason }) }); return true } catch { return false }
      },

      reportPost: async (postId, reason = 'Нарушение правил') => {
        try { await api('/api/reports', { method: 'POST', body: JSON.stringify({ targetType: 'post', targetId: postId, reason }) }); return true } catch { return false }
      },

      updateProfile: async (updatedData) => {
        const activeUserId = get().activeUserId
        try {
          const result = await api('/api/me', { method: 'PATCH', body: JSON.stringify(updatedData) })
          set(state => ({ users: state.users.map(user => user.id === activeUserId ? result.user : user) }))
          return true
        } catch { return false }
      },

      toggleBookmark: async (tweetId) => {
        try {
          const result = await api(`/api/posts/${tweetId}/bookmark`, { method: 'POST' })
          set(state => ({ bookmarks: result.bookmarked ? [tweetId, ...state.bookmarks.filter(id => id !== tweetId)] : state.bookmarks.filter(id => id !== tweetId) }))
        } catch { return }
      },

      addStory: async (text, image = null, mediaType = null) => {
        if (!text?.trim() && !image) return
        try { await api('/api/stories', { method: 'POST', body: JSON.stringify({ text, image, mediaType }) }) } catch { return }
        set((state) => ({ stories: [{ id: `s_${Date.now()}`, authorId: state.activeUserId, text: text?.trim() || '', image, mediaType, createdAt: new Date().toISOString() }, ...(state.stories || [])] }))
      },

      sendMessage: async (conversationId, text, media = null) => {
        const state = get()
        const activeUserId = state.activeUserId
        const conversation = state.conversations.find(c => c.id === conversationId)
        
        if (!conversation) return

        let newMessage = {
          id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          conversationId,
          senderId: activeUserId,
          text,
          timestamp: new Date().toISOString()
        }

        try {
          const result = await api(`/api/chats/${conversationId}/messages`, { method: 'POST', body: JSON.stringify({ text, ...(media || {}) }) })
          newMessage = normalizeMessage(result.message)
        } catch { return }

        set(state => ({
          messages: [...state.messages, newMessage],
          conversations: state.conversations.map(c => 
            c.id === conversationId ? { ...c, lastMessage: text || '📎 Медиафайл', timestamp: newMessage.timestamp, unread: false } : c
          ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        }))

      },

      createChat: async (userId) => {
        try {
          const result = await api('/api/chats', { method: 'POST', body: JSON.stringify({ userId }) })
          await get().fetchInitialData()
          return result.chatId
        } catch { return null }
      },

      receiveMessage: (message) => set(state => {
        const normalized = normalizeMessage(message)
        if (state.messages.some(item => item.id === normalized.id)) return state
        return {
          messages: [...state.messages, normalized],
          conversations: state.conversations.map(conversation => conversation.id === normalized.conversationId
            ? { ...conversation, lastMessage: normalized.text || '📎 Медиафайл', timestamp: normalized.timestamp, unread: normalized.senderId !== state.activeUserId }
            : conversation
          ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        }
      }),

      addTweet: async (content, parentId = null, image = null, mediaType = null) => {
        const activeUserId = get().activeUserId
        let result
        try { result = await api('/api/posts', { method: 'POST', body: JSON.stringify({ content, image, mediaType }) }) } catch { return }
        const id = result.id
        const newTweet = {
          id,
          authorId: activeUserId,
          content,
          image,
          mediaType,
          timestamp: new Date().toISOString(),
          parentId,
          stats: {
            likes: [],
            reposts: [],
            replies: [],
            views: 0,
          }
        }

        set((state) => {
          const updatedTweets = [newTweet, ...state.tweets]
          
          // If it's a reply, update the parent's replies list
          if (parentId) {
            return {
              tweets: updatedTweets.map(t => 
                t.id === parentId 
                  ? { ...t, stats: { ...t.stats, replies: [...t.stats.replies, newTweet.id] } } 
                  : t
              )
            }
          }
          
          return { tweets: updatedTweets }
        })
      },

      fetchInitialData: async () => {
        if (!getApiToken()) { set({ activeUserId: null, isBootstrapping: false, users: [], tweets: [], stories: [], conversations: [], messages: [], notifications: [], bookmarks: [], communities: [], lists: [] }); return }
        try {
          const [me, feed, stories, chats, directory, bookmarks] = await Promise.all([api('/api/me'), api('/api/feed'), api('/api/stories'), api('/api/chats'), api('/api/users/search?q='), api('/api/bookmarks')])
          const remoteUsers = [...directory.users, ...feed.posts.map(post => post.author), ...stories.stories.map(story => ({ id: story.userId, name: story.name, username: story.username, handle: `@${story.username}`, avatar: story.avatar, verified: false })), ...chats.chats.map(chat => ({ id: chat.participantId, name: chat.name, username: chat.username, handle: `@${chat.username}`, avatar: chat.avatar, online: Boolean(chat.online), lastSeen: chat.lastSeen, verified: Boolean(chat.verified), verifiedType: chat.verifiedType, premium: Boolean(chat.premiumUntil && new Date(chat.premiumUntil) > new Date()), stats: { followers: Number(chat.followers || 0), following: Number(chat.following || 0) } }))]
          const users = [me.user, ...remoteUsers.filter(user => user?.id && user.id !== me.user.id).filter((user, index, list) => list.findIndex(item => item.id === user.id) === index)]
          const conversations = chats.chats.map(chat => ({ id: chat.id, participantId: chat.participantId, lastMessage: chat.lastMessage || '', timestamp: chat.lastMessageAt || chat.createdAt, unread: false }))
          const messageGroups = await Promise.all(conversations.map(async conversation => { const result = await api(`/api/chats/${conversation.id}/messages`); return result.messages.map(normalizeMessage) }))
          set({ activeUserId: me.user.id, isBootstrapping: false, users, tweets: feed.posts, stories: stories.stories, conversations, messages: messageGroups.flat(), notifications: [], bookmarks: bookmarks.postIds || [], following: me.user.followingIds || [], communities: [], lists: [] })
        } catch { setApiToken(null); set({ activeUserId: null, isBootstrapping: false }) }
      },

      toggleLike: async (tweetId) => {
        try { const result = await api(`/api/posts/${tweetId}/like`, { method: 'POST' }); set(state => ({ tweets: state.tweets.map(tweet => tweet.id === tweetId ? { ...tweet, stats: { ...tweet.stats, liked: result.liked, likes: Math.max(0, (Array.isArray(tweet.stats.likes) ? tweet.stats.likes.length : tweet.stats.likes) + (result.liked ? 1 : -1)) } } : tweet) })) } catch (error) { void error }
      },

      toggleRepost: async (tweetId) => {
        try { const result = await api(`/api/posts/${tweetId}/repost`, { method: 'POST' }); set(state => ({ tweets: state.tweets.map(tweet => tweet.id === tweetId ? { ...tweet, stats: { ...tweet.stats, reposted: result.reposted, reposts: Math.max(0, (Array.isArray(tweet.stats.reposts) ? tweet.stats.reposts.length : tweet.stats.reposts) + (result.reposted ? 1 : -1)) } } : tweet) })) } catch (error) { void error }
      },

      editTweet: async (tweetId, content) => {
        try { await api(`/api/posts/${tweetId}`, { method: 'PATCH', body: JSON.stringify({ content }) }) } catch { return false }
        set(state => ({ tweets: state.tweets.map(tweet => tweet.id === tweetId ? { ...tweet, content } : tweet) }))
        return true
      },

      deleteTweet: async (tweetId) => {
        try { await api(`/api/posts/${tweetId}`, { method: 'DELETE' }) } catch { return false }
        set((state) => ({ tweets: state.tweets.filter(t => t.id !== tweetId) }))
        return true
      },

      initializeBot: () => {},
    })
)
