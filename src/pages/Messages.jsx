import React, { useState } from 'react'
import { Settings, Search, Send, MoreVertical, Image, Smile, ArrowLeft, PenLine } from 'lucide-react'
import { useStore } from '../store/useStore'
import { API_URL, api, getApiToken } from '../lib/api'
import Avatar from '../components/Avatar'
import { cn } from '../lib/utils'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

const ConversationItem = ({ conversation, active, onClick }) => {
  const users = useStore(state => state.users)
  const user = users.find(u => u.id === conversation.participantId)

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
      </div>
    </div>
  )
}

const MessageBubble = ({ message, isMe }) => (
  <div className={cn(
    "flex flex-col mb-4",
    isMe ? "items-end" : "items-start"
  )}>
    <div className={cn(
      "max-w-[85%] px-4 py-3 rounded-2xl",
      isMe ? "bg-primary text-white rounded-br-none" : "bg-[#2f3336] text-white rounded-bl-none"
    )}>
      <p className="text-[15px]">{message.text}</p>
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

  const activeConv = conversations.find(c => c.id === selectedConvId)
  const participant = users.find(u => u.id === activeConv?.participantId)
  const activeMessages = messages.filter(m => m.conversationId === selectedConvId)

  const messagesEndRef = React.useRef(null)
  const scrollContainerRef = React.useRef(null)
  const searchInputRef = React.useRef(null)

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
    const socket = new WebSocket(`${API_URL.replace(/^http/, 'ws')}/ws?token=${encodeURIComponent(getApiToken())}`)
    socket.onopen = () => socket.send(JSON.stringify({ type: 'chat:join', chatId: selectedConvId }))
    socket.onmessage = (event) => { try { const payload = JSON.parse(event.data); if (payload.type === 'message:new') receiveMessage(payload.message) } catch (error) { void error } }
    return () => socket.close()
  }, [selectedConvId, receiveMessage])

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
          {conversations.map(c => (
            <ConversationItem 
              key={c.id} 
              conversation={c} 
              active={selectedConvId === c.id}
              onClick={() => setSelectedConvId(c.id)}
            />
          ))}
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
                  <p className="text-secondary text-sm md:text-[15px] mt-3 text-center px-4">{participant?.online ? 'Сейчас в сети' : 'Был(а) недавно'}</p>
               </div>

               {activeMessages.map(m => (
                 <MessageBubble key={m.id} message={m} isMe={m.senderId === activeUserId} />
               ))}
               <div ref={messagesEndRef} />
            </div>

            <div className="chat-composer min-w-0 p-2 border-t border-border flex items-center gap-1 md:gap-2 bg-black sticky bottom-0 z-10">
              <div className="flex gap-0.5 md:gap-1 px-1 md:px-2">
                <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                  <Image size={18} className="md:w-5 md:h-5" />
                </button>
                <button className="hidden sm:block p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                  <Smile size={18} className="md:w-5 md:h-5" />
                </button>
              </div>
              <div className="flex-1 relative flex items-center">
                <input type="text" value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Напишите сообщение"
                  className="chat-input w-full bg-[#202327] rounded-2xl py-2 px-3 md:px-4 outline-none focus:bg-black focus:ring-1 focus:ring-primary transition-all text-sm md:text-[15px]"
                />
              </div>
              <button 
                onClick={() => {
                  if (messageText.trim()) {
                    sendMessage(selectedConvId, messageText)
                    setMessageText('')
                  }
                }}
                disabled={!messageText.trim()}
                className="p-2 text-primary disabled:opacity-50 hover:bg-primary/10 rounded-full transition-colors"
              >
                <Send size={18} className="md:w-5 md:h-5" />
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
