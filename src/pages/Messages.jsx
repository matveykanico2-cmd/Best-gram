import React, { useState } from 'react'
import { Settings, Search, Send, MoreVertical, Smile, ArrowLeft, PenLine, Paperclip, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { API_URL, api, getApiToken } from '../lib/api'
import Avatar from '../components/Avatar'
import { cn } from '../lib/utils'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { pushNotification } from '../lib/notifications'

const ConversationItem = ({ conversation, active, onClick }) => {
  const users = useStore(state => state.users)
  const user = users.find(u => u.id === conversation.participantId)
  const presence = user?.online ? 'в сети' : user?.lastSeen ? `был(а) ${format(new Date(user.lastSeen), 'dd.MM в HH:mm')}` : 'статус неизвестен'

  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex gap-3 px-4 py-4 cursor-pointer hover:bg-white/5 transition-colors border-r-2",
        active ? "bg-white/5 border-primary" : "border-transparent"
      )}
    >
      <Avatar src={user?.avatar} name={user?.name} className="w-12 h-12 rounded-full" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 min-w-0">
            <span className="max-w-[58%] break-words font-bold">{user?.name || 'Пользователь'}</span>
            <span className="max-w-[38%] break-all text-secondary">{user?.handle}</span>
          </div>
          <span className="shrink-0 text-secondary text-sm ml-2">
            {format(new Date(conversation.timestamp), 'dd.MM')}
          </span>
        </div>
        <div className="flex justify-between items-center mt-0.5">
          <p className={cn(
            "text-sm break-words line-clamp-2",
            conversation.unread ? "font-bold text-white" : "text-secondary"
          )}>
            {conversation.lastMessage || 'Нет сообщений'}
          </p>
          {conversation.unread && (
            <div className="w-2 h-2 bg-primary rounded-full ml-2 shrink-0" />
          )}
        </div>
        <p className={cn('mt-1 truncate text-xs', user?.online ? 'text-[#5de4ca]' : 'text-secondary')}>{presence}</p>
      </div>
    </div>
  )
}

const MessageBubble = ({ message, isMe }) => (
  <div className={cn(
    "flex flex-col mb-4",
    isMe ? "items-end" : "items-start"
  )}>
    <div className={cn('message-bubble', isMe ? 'message-bubble-own' : 'message-bubble-incoming')}>
      {message.mediaUrl && message.mediaType === 'image' && <img src={message.mediaUrl} alt={message.mediaName || 'Изображение'} className="mb-2 max-h-72 max-w-full rounded-xl object-contain" />}
      {message.mediaUrl && message.mediaType === 'video' && <video src={message.mediaUrl} controls className="mb-2 max-h-72 max-w-full rounded-xl" />}
      {message.mediaUrl && message.mediaType === 'audio' && <audio src={message.mediaUrl} controls className="mb-2 max-w-full" />}
      {message.text && <p className="whitespace-pre-wrap break-words text-[15px]">{message.text}</p>}
    </div>
    <span className="text-secondary text-xs mt-1 px-1">
      {format(new Date(message.timestamp), 'HH:mm')}{isMe && <span className="ml-2 text-[#5de4ca]">{message.readAt ? 'Прочитано' : 'Доставлено'}</span>}
    </span>
  </div>
)

export default function Messages() {
  const { conversations, messages, users, activeUserId, sendMessage, createChat, receiveMessage } = useStore()
  const navigate = useNavigate()
  const [selectedConvId, setSelectedConvId] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [wallpaper, setWallpaper] = useState('aurora')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [mediaDraft, setMediaDraft] = useState(null)

  const activeConv = conversations.find(c => c.id === selectedConvId)
  const participant = users.find(u => u.id === activeConv?.participantId)
  const activeMessages = messages.filter(m => m.conversationId === selectedConvId)

  const messagesEndRef = React.useRef(null)
  const scrollContainerRef = React.useRef(null)
  const searchInputRef = React.useRef(null)
  const mediaInputRef = React.useRef(null)

  const handleMedia = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > 6 * 1024 * 1024) return window.alert('Файл должен быть не больше 6 МБ')
    const mediaType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : null
    if (!mediaType) return window.alert('Поддерживаются фото, видео и аудио')
    const reader = new FileReader()
    reader.onload = () => setMediaDraft({ mediaType, mediaUrl: String(reader.result || ''), mediaName: file.name })
    reader.readAsDataURL(file)
  }

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
    setShouldAutoScroll(isAtBottom)
  }

  React.useEffect(() => {
    if (shouldAutoScroll) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeMessages, shouldAutoScroll])

  React.useEffect(() => {
    if (!selectedConvId || !getApiToken()) return undefined
    api(`/api/chats/${selectedConvId}/read`, { method: 'POST' }).catch(() => {})
    let reconnectTimer
    let socket
    const connect = () => {
      socket = new WebSocket(`${API_URL.replace(/^http/, 'ws')}/ws?token=${encodeURIComponent(getApiToken())}`)
      socket.onopen = () => socket.send(JSON.stringify({ type: 'chat:join', chatId: selectedConvId }))
      socket.onmessage = (event) => { try { const payload = JSON.parse(event.data); if (payload.type === 'message:new') { receiveMessage(payload.message); if (payload.message.senderId !== activeUserId) pushNotification('Новое сообщение', { body: payload.message.text || 'Вам отправили медиафайл', tag: `chat-${selectedConvId}` }) } } catch (error) { void error } }
      socket.onclose = () => { if (selectedConvId) reconnectTimer = window.setTimeout(connect, 1500) }
    }
    connect()
    return () => { window.clearTimeout(reconnectTimer); socket?.close() }
  }, [selectedConvId, receiveMessage, activeUserId])

  const handleBack = () => setSelectedConvId(null)

  return (
    <div className="messages-shell flex min-w-0 flex-1 md:ml-20 xl:ml-64 w-full max-w-full overflow-hidden">
      {/* Conversation List */}
      <div className={cn(
        "w-full md:max-w-[400px] border-r border-border flex flex-col transition-all",
        selectedConvId ? "hidden md:flex" : "flex"
      )}>
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-xl font-bold">Сообщения</h1>
            <div className="flex gap-1">
              <button onClick={() => navigate('/settings')} title="Настройки сообщений" className="p-2 hover:bg-hover rounded-full transition-colors">
                <Settings size={20} />
              </button>
              <button onClick={() => { setSearchQuery(''); window.setTimeout(() => searchInputRef.current?.focus(), 0) }} title="Написать сообщение" className="flex items-center gap-2 rounded-full bg-primary px-3 py-2 font-bold text-[#06121f] transition hover:brightness-110">
                <PenLine size={17} />
                <span className="hidden sm:inline">Написать</span>
              </button>
            </div>
          </div>
          <div className="px-4 py-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary" size={18} />
              <input ref={searchInputRef} type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Найти пользователя или начать чат" className="chat-input w-full bg-[#202327] rounded-full py-2 pl-10 pr-4 outline-none focus:bg-black focus:ring-1 focus:ring-primary transition-all text-sm" />
              {searchQuery.trim() && <div className="absolute left-0 right-0 top-11 z-20 rounded-2xl border border-[#20344b] bg-[#0d1d2f] p-2 shadow-2xl">{users.filter(user => user.id !== activeUserId && `${user.name} ${user.handle}`.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5).map(user => <button key={user.id} onClick={async () => { const chatId = await createChat(user.id); if (chatId) setSelectedConvId(chatId); setSearchQuery('') }} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-[#12263a]"><Avatar src={user.avatar} name={user.name} className="h-8 w-8 rounded-full" /><span><b className="block text-sm">{user.name}</b><small className="text-[#91a8bb]">{user.handle}</small></span></button>)}</div>}
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length ? conversations.map(c => (
            <ConversationItem 
              key={c.id} 
              conversation={c} 
              active={selectedConvId === c.id}
              onClick={() => setSelectedConvId(c.id)}
            />
          )) : <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center"><div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-[#12263a] text-3xl">💬</div><h2 className="text-lg font-bold">Чатов пока нет</h2><p className="mt-2 max-w-xs text-sm text-secondary">Найдите пользователя сверху и нажмите «Написать», чтобы начать диалог.</p><button onClick={() => { setSearchQuery(''); window.setTimeout(() => searchInputRef.current?.focus(), 0) }} className="mt-5 rounded-full bg-primary px-5 py-2.5 font-bold text-[#06121f]">Найти человека</button></div>}
        </div>
      </div>

      {/* Chat Window */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 bg-black transition-all",
        !selectedConvId ? "hidden md:flex" : "flex"
      )}>
        {activeConv ? (
          <>
            <div className="sticky top-0 bg-[#07111f]/85 backdrop-blur-md z-10 h-14 border-b border-border flex items-center gap-3 px-4">
              <button 
                onClick={handleBack}
                className="md:hidden p-2 -ml-2 hover:bg-hover rounded-full transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3 min-w-0 cursor-pointer hover:bg-white/5 p-1 rounded-lg">
                <Avatar src={participant?.avatar} name={participant?.name} className="w-8 h-8 rounded-full" />
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-[15px] leading-tight truncate">{participant?.name}</span>
                  <span className={cn('text-[13px] leading-tight truncate', participant?.online ? 'text-[#5de4ca]' : 'text-secondary')}>{participant?.online ? 'в сети' : participant?.lastSeen ? `был(а) ${format(new Date(participant.lastSeen), 'dd.MM в HH:mm')}` : participant?.handle}</span>
                </div>
              </div>
              <button onClick={() => setWallpaper(wallpaper === 'aurora' ? 'grid' : 'aurora')} title="Сменить фон чата" className="p-2 ml-auto hover:bg-hover rounded-full transition-colors text-[#5de4ca]">
                <MoreVertical size={20} />
              </button>
            </div>

            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              style={{ backgroundImage: wallpaper === 'aurora' ? 'radial-gradient(circle at 20% 10%, rgba(56,227,193,.10), transparent 30%), radial-gradient(circle at 80% 90%, rgba(21,159,206,.10), transparent 30%)' : 'linear-gradient(rgba(32,52,75,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(32,52,75,.18) 1px, transparent 1px)', backgroundSize: wallpaper === 'aurora' ? 'auto' : '28px 28px' }}
              className="flex-1 overflow-y-auto p-4 flex flex-col pb-20 md:pb-4"
            >
               <div className="flex flex-col items-center py-10 border-b border-border mb-8">
                  <Avatar src={participant?.avatar} name={participant?.name} className="w-16 h-16 rounded-full mb-2" />
                  <span className="font-bold text-xl text-center px-4">{participant?.name}</span>
                  <span className="text-secondary">{participant?.handle}</span>
                  <p className="text-secondary text-sm md:text-[15px] mt-3 text-center px-4">{participant?.online ? 'Сейчас в сети' : participant?.lastSeen ? `Последний вход: ${format(new Date(participant.lastSeen), 'dd.MM.yyyy в HH:mm')}` : 'Время последнего входа неизвестно'}</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs text-[#91a8bb]"><span className="rounded-full bg-[#12263a] px-3 py-1">Подписчики: {participant?.stats?.followers ?? 0}</span><span className="rounded-full bg-[#12263a] px-3 py-1">Подписки: {participant?.stats?.following ?? 0}</span>{participant?.premium && <span className="rounded-full bg-[#f5c451]/15 px-3 py-1 text-[#f5c451]">Premium</span>}</div>
               </div>

               {activeMessages.map(m => (
                 <MessageBubble key={m.id} message={m} isMe={m.senderId === activeUserId} />
               ))}
               <div ref={messagesEndRef} />
            </div>

            <div className="chat-composer relative min-w-0 p-2 border-t border-border flex items-center gap-1 md:gap-2 bg-black sticky bottom-0 z-10">
              {emojiOpen && <div className="absolute bottom-full left-2 mb-2 grid grid-cols-8 gap-1 rounded-2xl border border-border bg-[#0d1d2f] p-3 shadow-2xl">{['😀','😂','😍','😎','😭','🔥','✨','❤️','👍','🎉','🤝','🙏','🤔','😡','🥳','💬'].map(emoji => <button key={emoji} type="button" onClick={() => { setMessageText(value => `${value}${emoji}`); setEmojiOpen(false) }} className="rounded-lg p-2 text-xl hover:bg-[#12263a]">{emoji}</button>)}</div>}
              <div className="flex gap-0.5 md:gap-1 px-1 md:px-2">
              <button type="button" onClick={() => mediaInputRef.current?.click()} title="Прикрепить фото, видео или аудио" className="chat-action-button p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                  <Paperclip size={20} />
                </button>
                <input ref={mediaInputRef} type="file" accept="image/*,video/*,audio/*" onChange={handleMedia} className="hidden" />
                <button type="button" onClick={() => setEmojiOpen(value => !value)} title="Emoji" className="chat-action-button p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                  <Smile size={20} />
                </button>
              </div>
              {mediaDraft && <button type="button" onClick={() => setMediaDraft(null)} title="Убрать вложение" className="flex max-w-20 items-center gap-1 rounded-lg bg-[#12263a] px-2 py-1 text-xs text-[#5de4ca]"><span className="truncate">{mediaDraft.mediaName}</span><X size={14} /></button>}
              <div className="flex-1 relative flex items-center">
                <input type="text" value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Напишите сообщение"
                  className="chat-input w-full bg-[#202327] rounded-2xl py-2 px-3 md:px-4 outline-none focus:bg-black focus:ring-1 focus:ring-primary transition-all text-sm md:text-[15px]"
                />
              </div>
              <button 
                onClick={() => {
                  if (messageText.trim() || mediaDraft) {
                    sendMessage(selectedConvId, messageText, mediaDraft)
                    setMessageText('')
                    setMediaDraft(null)
                    setEmojiOpen(false)
                  }
                }}
                disabled={!messageText.trim() && !mediaDraft}
                className="p-2 text-primary disabled:opacity-50 hover:bg-primary/10 rounded-full transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <h2 className="text-3xl font-bold mb-2">Выберите чат</h2>
            <p className="text-secondary max-w-sm">Здесь появятся ваши личные сообщения и новые диалоги.</p>
            <button onClick={() => conversations[0] && setSelectedConvId(conversations[0].id)} className="mt-6 bg-primary text-white font-bold px-6 py-3 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50" disabled={!conversations.length}>
              Открыть первый чат
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
