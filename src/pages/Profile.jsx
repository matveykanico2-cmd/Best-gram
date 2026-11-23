import { useState } from 'react'
import { ArrowLeft, CalendarDays, Link as LinkIcon, MapPin, MoreHorizontal, Circle, ShieldBan, Flag } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import TweetCard from '../components/TweetCard'
import EditProfileModal from '../components/EditProfileModal'
import VerifiedBadge from '../components/VerifiedBadge'
import { cn } from '../lib/utils'
import { AnimatePresence } from 'framer-motion'
import Avatar from '../components/Avatar'

const TABS = ['Ответы', 'Избранное', 'Медиа', 'Лайки']

export default function Profile() {
  const navigate = useNavigate()
  const { userId: paramId } = useParams()
  const [activeTab, setActiveTab] = useState('Ответы')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSafetyMenuOpen, setIsSafetyMenuOpen] = useState(false)
  const { users, activeUserId, tweets, following, toggleFollow, blockUser, reportUser } = useStore()
  
  const displayId = paramId || activeUserId
  const user = users.find(u => u.id === displayId)
  const isMe = displayId === activeUserId
  const isFollowing = following.includes(displayId)

  const userTweets = tweets.filter(t => t.authorId === displayId && !t.parentId)
  const userReplies = tweets.filter(t => t.authorId === displayId && t.parentId)
  
  // For "Likes" tab, we'd need to filter tweets where user's ID is in tweet.stats.likes
  const likedTweets = tweets.filter(t => Array.isArray(t.stats.likes) && t.stats.likes.includes(displayId))

  const renderTweets = () => {
    switch (activeTab) {
      case 'Ответы':
        return userReplies.map(t => <TweetCard key={t.id} tweet={t} isReply />)
      case 'Лайки':
        return likedTweets.map(t => <TweetCard key={t.id} tweet={t} />)
      default:
        return (
          <div className="p-10 text-center">
            <h2 className="text-xl font-bold mb-1">No {activeTab.toLowerCase()} yet</h2>
            <p className="text-secondary text-sm">When you post {activeTab.toLowerCase()}, they'll show up here.</p>
          </div>
        )
    }
  }

  return (
    <div className="flex-1 border-r border-border min-h-screen max-w-[600px] md:ml-20 xl:ml-64 w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md px-4 py-1 border-b border-border flex items-center gap-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-hover rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <h1 className="text-xl font-bold">{user?.name}</h1>
            <VerifiedBadge type={user?.verifiedType} />
          </div>
          <p className="text-secondary text-[13px]">{userTweets.length} posts</p>
        </div>
      </div>

      {/* Banner & Avatar */}
      <div className="relative">
        <div className="h-48 bg-[#333639]">
          {user?.banner && (
            <img 
              src={user.banner} 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="px-4">
          <div className="relative flex justify-between items-end -mt-16 mb-4">
            <div className="p-1 bg-black rounded-full">
              <Avatar src={user?.avatar} name={user?.name} className="w-32 h-32 rounded-full border-4 border-black object-cover" />
            </div>
            {isMe ? (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="border border-border hover:bg-hover font-bold px-4 py-2 rounded-full transition-colors mb-2"
              >
                Редактировать профиль
              </button>
            ) : (
              <div className="flex gap-2 mb-2">
                <button onClick={() => setIsSafetyMenuOpen(value => !value)} title="Дополнительные действия" className="p-2 border border-border rounded-full hover:bg-hover transition-colors">
                  <MoreHorizontal size={20} />
                </button>
                <button 
                  onClick={() => toggleFollow(displayId)}
                  className={cn(
                    "font-bold px-4 py-2 rounded-full transition-colors",
                    isFollowing 
                      ? "border border-border hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 group" 
                      : "bg-white text-black hover:bg-white/90"
                  )}
                >
                  {isFollowing ? (
                    <>
                      <span className="group-hover:hidden">Подписка оформлена</span>
                      <span className="hidden group-hover:inline">Отписаться</span>
                    </>
                  ) : "Подписаться"}
                </button>
                {isSafetyMenuOpen && <div className="absolute right-4 top-14 z-20 w-56 overflow-hidden rounded-2xl border border-border bg-[#0d1d2f] p-1 shadow-2xl"><button onClick={async () => { if (window.confirm('Заблокировать этого пользователя?')) { await blockUser(displayId); setIsSafetyMenuOpen(false); navigate('/'); } }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-red-500/10 hover:text-red-300"><ShieldBan size={18} /> Заблокировать</button><button onClick={async () => { const reason = window.prompt('Причина жалобы', 'Нарушение правил'); if (reason?.trim() && await reportUser(displayId, reason)) { setIsSafetyMenuOpen(false); window.alert('Жалоба отправлена модераторам'); } }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-[#12263a]"><Flag size={18} /> Пожаловаться</button></div>}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="mb-4">
            <div className="flex items-center gap-1">
              <h2 className="text-xl font-bold leading-tight">{user?.name}</h2>
              <VerifiedBadge type={user?.verifiedType} className="h-5 w-5" />
            </div>
            <p className="text-secondary mb-3">{user?.handle}</p>
            <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-[#91a8bb]">{user?.online && <span className="flex items-center gap-1 text-[#5de4ca]"><Circle size={9} fill="currentColor" /> В сети</span>}{isMe && user?.phone && <span>Телефон: {user.phone}</span>}{user?.premium && <span className="rounded-full bg-[#f5c451]/15 px-2 py-1 text-[#f5c451]">Premium</span>}</div>
            
            <p className="text-[15px] mb-3">
              {user?.bio}
            </p>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-secondary text-[15px] mb-3">
              <div className="flex items-center gap-1">
                <MapPin size={18} />
                <span>{user?.location}</span>
              </div>
              {user?.website && (
                <div className="flex items-center gap-1 text-primary hover:underline cursor-pointer">
                  <LinkIcon size={18} />
                  <span>{user?.website}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <CalendarDays size={18} />
                <span>В best-gram с {user?.joined}</span>
              </div>
              {isMe && user?.birthDate && <div className="flex items-center gap-1"><CalendarDays size={18} /><span>День рождения: {new Date(`${user.birthDate}T00:00:00`).toLocaleDateString('ru-RU')}</span></div>}
            </div>

            <div className="flex gap-4 text-[15px]">
              <div className="hover:underline cursor-pointer">
                <span className="font-bold text-white">{user?.stats?.following?.toLocaleString()}</span>
                <span className="text-secondary ml-1">Подписок</span>
              </div>
              <div className="hover:underline cursor-pointer">
                <span className="font-bold text-white">{user?.stats?.followers?.toLocaleString()}</span>
                <span className="text-secondary ml-1">Подписчиков</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 min-w-fit px-4 h-14 hover:bg-white/5 transition-colors relative flex items-center justify-center"
            >
              <span className={cn(
                "text-[15px] font-medium whitespace-nowrap",
                activeTab === tab ? "text-white font-bold" : "text-secondary"
              )}>
                {tab}
              </span>
              {activeTab === tab && (
                <div className="absolute bottom-0 h-1 w-full max-w-[60px] bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col pb-20">
        {renderTweets()}
      </div>

      <AnimatePresence>
        {isEditModalOpen && (
          <EditProfileModal 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}
