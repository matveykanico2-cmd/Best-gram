import { useState } from 'react'
import { Settings, Heart, Repeat, User, AtSign } from 'lucide-react'
import { useStore } from '../store/useStore'
import { cn } from '../lib/utils'
import { formatDistanceToNow } from 'date-fns'
import Avatar from '../components/Avatar'
import { useNavigate } from 'react-router-dom'

const TABS = ['All', 'Verified', 'Mentions']

const NotificationItem = ({ notification }) => {
  const { users, tweets, activeUserId } = useStore()
  const activeUser = users.find(u => u.id === activeUserId)
  const user = users.find(u => u.id === notification.userId)
  const tweet = tweets.find(t => t.id === notification.tweetId)

  const renderContent = () => {
    switch (notification.type) {
      case 'like':
        return (
          <div className="flex gap-3 px-4 py-3 border-b border-border hover:bg-white/5 cursor-pointer transition-colors">
            <Heart className="text-[#f91880] fill-[#f91880]" size={28} />
            <div className="flex flex-col gap-2">
              <Avatar src={user?.avatar} name={user?.name} className="w-8 h-8 rounded-full" />
              <div>
                <span className="font-bold">{user?.name}</span> liked your post
              </div>
              <div className="text-secondary line-clamp-2">
                {tweet?.content}
              </div>
            </div>
          </div>
        )
      case 'repost':
        return (
          <div className="flex gap-3 px-4 py-3 border-b border-border hover:bg-white/5 cursor-pointer transition-colors">
            <Repeat className="text-[#00ba7c]" size={28} />
            <div className="flex flex-col gap-2">
              <Avatar src={user?.avatar} name={user?.name} className="w-8 h-8 rounded-full" />
              <div>
                <span className="font-bold">{user?.name}</span> reposted your post
              </div>
              <div className="text-secondary line-clamp-2">
                {tweet?.content}
              </div>
            </div>
          </div>
        )
      case 'follow':
        return (
          <div className="flex gap-3 px-4 py-3 border-b border-border hover:bg-white/5 cursor-pointer transition-colors">
            <User className="text-primary fill-primary" size={28} />
            <div className="flex flex-col gap-2">
              <Avatar src={user?.avatar} name={user?.name} className="w-8 h-8 rounded-full" />
              <div>
                <span className="font-bold">{user?.name}</span> followed you
              </div>
            </div>
          </div>
        )
      case 'mention':
        return (
          <div className="flex gap-3 px-4 py-3 border-b border-border hover:bg-white/5 cursor-pointer transition-colors">
            <div className="w-7 flex justify-center">
               <AtSign className="text-primary" size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Avatar src={user?.avatar} name={user?.name} className="w-10 h-10 rounded-full" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[15px]">{user?.name}</span>
                    <span className="text-secondary text-[15px]">{user?.handle}</span>
                    <span className="text-secondary text-[15px]">·</span>
                    <span className="text-secondary text-[15px]">{formatDistanceToNow(new Date(notification.timestamp))}</span>
                  </div>
                  <div className="text-[15px]">
                    Replying to <span className="text-primary">{activeUser?.handle}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-[15px]">
                {tweet?.content}
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return renderContent()
}

export default function Notifications() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('All')
  const notifications = useStore(state => state.notifications)

  return (
    <div className="flex-1 border-r border-border min-h-screen max-w-[600px] md:ml-20 xl:ml-64 w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">Notifications</h1>
          <button onClick={() => navigate('/settings')} title="Настройки уведомлений" className="p-2 hover:bg-hover rounded-full transition-colors">
            <Settings size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 h-14 hover:bg-white/5 transition-colors relative flex items-center justify-center"
            >
              <span className={cn(
                "text-[15px] font-medium",
                activeTab === tab ? "text-white font-bold" : "text-secondary"
              )}>
                {tab}
              </span>
              {activeTab === tab && (
                <div className="absolute bottom-0 h-1 w-14 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex flex-col">
        {notifications.length > 0 ? (
          notifications.map(n => (
            <NotificationItem key={n.id} notification={n} />
          ))
        ) : (
          <div className="p-10 text-center">
            <h2 className="text-3xl font-bold mb-2">Пока здесь пусто</h2>
            <p className="text-secondary">Здесь появятся лайки, репосты, подписки и упоминания.</p>
          </div>
        )}
      </div>
    </div>
  )
}
