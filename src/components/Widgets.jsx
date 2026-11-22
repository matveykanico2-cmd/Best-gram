import React from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { cn } from '../lib/utils'
import VerifiedBadge from './VerifiedBadge'
import Avatar from './Avatar'

const FollowSuggestion = ({ id, name, handle, avatar, verifiedType = 'blue' }) => {
  const navigate = useNavigate()
  const { following, toggleFollow } = useStore()
  const isFollowing = following.includes(id)

  return (
    <div className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors flex items-center justify-between group/item">
      <div 
        className="flex gap-3 min-w-0"
        onClick={() => navigate(`/profile/${id}`)}
      >
        <Avatar src={avatar} name={name} className="w-10 h-10 rounded-full" />
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-bold text-sm hover:underline truncate">{name}</span>
            <VerifiedBadge type={verifiedType} className="h-4 w-4" />
          </div>
          <div className="text-secondary text-sm truncate">{handle}</div>
        </div>
      </div>
      <button 
        onClick={() => toggleFollow(id)}
        className={cn(
          "font-bold px-4 py-1.5 rounded-full text-sm transition-colors shrink-0",
          isFollowing 
            ? "border border-border hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 group" 
            : "bg-white text-black hover:bg-white/90"
        )}
      >
        {isFollowing ? (
          <span className="group-hover:hidden">Following</span>
        ) : "Follow"}
      </button>
    </div>
  )
}

export default function Widgets() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isSearchFocused, setIsSearchFocused] = React.useState(false)
  const { tweets, users, activeUserId } = useStore()

  const filteredTweets = searchQuery 
    ? tweets.filter(t => t.content.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : []
  
  const filteredUsers = searchQuery
    ? users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.handle.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : []

  return (
    <div className="hidden lg:flex flex-col gap-4 w-[350px] ml-8 py-2 sticky top-0 h-screen">
      <div className="relative group z-50">
        <div className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
          isSearchFocused ? "text-primary" : "text-secondary"
        )}>
          <Search size={18} />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchQuery.trim()) {
              navigate(`/search?q=${searchQuery.trim()}`)
              setIsSearchFocused(false)
            }
          }}
          placeholder="Поиск в best-gram" 
          className="w-full bg-[#202327] rounded-full py-3 pl-12 pr-4 outline-none focus:bg-black focus:ring-1 focus:ring-primary transition-all"
        />

        {/* Search Results Dropdown */}
        {(isSearchFocused && searchQuery) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-black border border-border rounded-xl shadow-xl shadow-white/5 min-h-[100px] max-h-[80vh] overflow-y-auto no-scrollbar">
            {filteredUsers.length === 0 && filteredTweets.length === 0 ? (
              <div className="p-8 text-center text-secondary">
                Ничего не найдено по запросу «{searchQuery}»
              </div>
            ) : (
              <>
                {filteredUsers.length > 0 && (
                  <div className="py-2 border-b border-border">
                    <h3 className="px-4 py-2 font-bold text-lg">Пользователи</h3>
                    {filteredUsers.map(user => (
                      <div key={user.id} className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-3">
                        <Avatar src={user.avatar} name={user.name} className="w-10 h-10 rounded-full" />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-bold truncate">{user.name}</span>
                            <VerifiedBadge type={user.verifiedType} className="h-4 w-4" />
                          </div>
                          <span className="text-secondary text-sm truncate">{user.handle}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {filteredTweets.length > 0 && (
                  <div className="py-2">
                    <h3 className="px-4 py-2 font-bold text-lg">Публикации</h3>
                    {filteredTweets.map(tweet => (
                      <div key={tweet.id} className="px-4 py-3 hover:bg-white/5 cursor-pointer flex flex-col gap-1">
                        <div className="text-sm line-clamp-2">{tweet.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <h2 className="text-xl font-bold px-4 py-3">Что обсуждают</h2>
        <div className="px-4 pb-5 text-sm text-secondary">Здесь появятся обсуждения после первых публикаций.</div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <h2 className="text-xl font-bold px-4 py-3">Кого читать</h2>
        {users
          .filter(u => u.id !== activeUserId && u.role !== 'bot' && u.role !== 'admin')
          .slice(0, 3)
          .map(user => (
            <FollowSuggestion 
              key={user.id}
              id={user.id}
              name={user.name}
              handle={user.handle}
              avatar={user.avatar}
              verifiedType={user.verifiedType}
            />
          ))
        }
        {users.filter(u => u.id !== activeUserId && u.role !== 'bot' && u.role !== 'admin').length === 0 && <div className="px-4 pb-5 text-sm text-secondary">Пока никто не найден.</div>}
      </div>

      <div className="px-4 text-secondary text-[13px] flex flex-wrap gap-x-3 gap-y-1">
        <span className="hover:underline cursor-pointer">Правила</span>
        <span className="hover:underline cursor-pointer">Конфиденциальность</span>
        <span className="hover:underline cursor-pointer">Помощь</span>
        <span>© 2026 best-gram</span>
      </div>
    </div>
  )
}
