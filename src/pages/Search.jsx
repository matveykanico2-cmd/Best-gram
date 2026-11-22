import React, { useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search as SearchIcon, Settings } from 'lucide-react'
import { useStore } from '../store/useStore'
import TweetCard from '../components/TweetCard'
import { cn } from '../lib/utils'
import Avatar from '../components/Avatar'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const navigate = useNavigate()
  const { tweets, users, following, toggleFollow } = useStore()

  const [activeTab, setActiveTab] = React.useState('top')

  const filteredTweets = useMemo(() => {
    if (!query) return []
    return tweets.filter(t => 
      t.content.toLowerCase().includes(query.toLowerCase())
    )
  }, [tweets, query])

  const filteredUsers = useMemo(() => {
    if (!query) return []
    return users.filter(u => 
      u.name.toLowerCase().includes(query.toLowerCase()) || 
      u.handle.toLowerCase().includes(query.toLowerCase())
    )
  }, [users, query])

  return (
    <div className="flex-1 border-r border-border min-h-screen max-w-[600px] md:ml-20 xl:ml-64 w-full">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-6 px-4 py-2">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-hover rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
            <input 
              type="text" 
              defaultValue={query}
              placeholder="Поиск в best-gram"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/search?q=${e.target.value}`)
                }
              }}
              className="w-full bg-[#202327] rounded-full py-2 pl-10 pr-4 outline-none focus:bg-black focus:ring-1 focus:ring-primary transition-all text-[15px]"
            />
          </div>
          <button onClick={() => navigate('/settings')} title="Настройки поиска" className="p-2 hover:bg-hover rounded-full transition-colors">
            <Settings size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mt-2">
          {['Top', 'Latest', 'People', 'Photos', 'Videos'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className="flex-1 py-4 hover:bg-white/5 transition-colors relative"
            >
              <span className={cn(
                "text-[15px]",
                activeTab === tab.toLowerCase() ? "font-bold text-white" : "text-secondary font-medium"
              )}>
                {tab}
              </span>
              {activeTab === tab.toLowerCase() && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex flex-col">
        {activeTab === 'people' ? (
          filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <div 
                key={user.id}
                onClick={() => navigate(`/profile/${user.id}`)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors"
              >
                <Avatar src={user.avatar} name={user.name} className="w-12 h-12 rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold hover:underline">{user.name}</span>
                      <span className="text-secondary text-sm">{user.handle}</span>
                    </div>
                    <button onClick={(event) => { event.stopPropagation(); toggleFollow(user.id) }} className="bg-white text-black font-bold px-4 py-1.5 rounded-full text-sm hover:bg-[#d7dbdc] transition-colors">
                      {following.includes(user.id) ? 'Подписка оформлена' : 'Подписаться'}
                    </button>
                  </div>
                  {user.bio && <p className="text-[15px] mt-1 line-clamp-2">{user.bio}</p>}
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><SearchIcon size={22} /></div>
              <h2 className="mt-4 text-xl font-bold">Ничего не найдено</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-secondary">По запросу «{query}» пока нет пользователей или публикаций.</p>
            </div>
          )
        ) : (
          filteredTweets.length > 0 ? (
            filteredTweets.map(tweet => (
              <TweetCard key={tweet.id} tweet={tweet} />
            ))
          ) : (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><SearchIcon size={22} /></div>
              <h2 className="mt-4 text-xl font-bold">Ничего не найдено</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-secondary">По запросу «{query}» пока нет результатов.</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}
