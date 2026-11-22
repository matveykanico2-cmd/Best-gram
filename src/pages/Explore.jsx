import { useState } from 'react'
import { Search, Settings } from 'lucide-react'
import { cn } from '../lib/utils'
import { useStore } from '../store/useStore'
import VerifiedBadge from '../components/VerifiedBadge'
import Avatar from '../components/Avatar'
import { useNavigate } from 'react-router-dom'
import TweetCard from '../components/TweetCard'

const TABS = ['Для вас', 'Популярное', 'Новости', 'Спорт', 'Развлечения']

export default function Explore() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Для вас')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const { tweets, users } = useStore()

  const filteredTweets = searchQuery 
    ? tweets.filter(t => t.content.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : []
  
  const filteredUsers = searchQuery
    ? users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.handle.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : []

  const visiblePosts = tweets.filter(tweet => !searchQuery || tweet.content.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex-1 border-r border-border min-h-screen max-w-[600px] md:ml-20 xl:ml-64 w-full">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-4 px-4 py-2">
          <div className="flex-1 relative group">
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
              placeholder="Поиск Bestgram" 
              className="w-full bg-[#202327] rounded-full py-2.5 pl-12 pr-4 outline-none focus:bg-black focus:ring-1 focus:ring-primary transition-all text-sm"
            />

            {/* Search Results Dropdown */}
            {(isSearchFocused && searchQuery) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-black border border-border rounded-xl shadow-xl shadow-white/20 min-h-[100px] max-h-[80vh] overflow-y-auto z-50">
                {filteredUsers.length === 0 && filteredTweets.length === 0 ? (
                  <div className="p-8 text-center text-secondary">
                    Нет результатов для «{searchQuery}»
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
                          <div key={tweet.id} className="px-4 py-3 hover:bg-white/5 cursor-pointer flex flex-col gap-1 border-b border-border last:border-0">
                            <div className="text-sm line-clamp-3">{tweet.content}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          <button onClick={() => navigate('/settings')} title="Настройки обзора" className="p-2 hover:bg-hover rounded-full transition-colors">
            <Settings size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 min-w-fit px-4 h-14 hover:bg-white/5 transition-colors relative flex items-center justify-center"
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

      {/* Trends List */}
      <div className="py-2">
        <h3 className="px-4 py-3 text-xl font-bold">Обсуждения</h3>
        {visiblePosts.length ? visiblePosts.slice(0, 20).map(tweet => <TweetCard key={tweet.id} tweet={tweet} />) : <div className="px-4 py-8 text-center text-secondary">Пока нет публикаций. Здесь появятся реальные посты пользователей.</div>}
      </div>

      <div className="border-t border-border p-6 text-center text-sm text-secondary">В обзоре показываются только реальные публикации из базы Bestgram.</div>
    </div>
  )
}
