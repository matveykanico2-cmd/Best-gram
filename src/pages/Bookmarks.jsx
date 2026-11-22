import { useStore } from '../store/useStore'
import TweetCard from '../components/TweetCard'
import { MoreHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Bookmarks() {
  const { tweets, bookmarks, users, activeUserId } = useStore()
  const navigate = useNavigate()
  const user = users.find(u => u.id === activeUserId)
  
  const bookmarkedTweets = tweets.filter(t => bookmarks.includes(t.id))

  return (
    <div className="flex-1 border-r border-border min-h-screen max-w-[600px] md:ml-20 xl:ml-64 w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Bookmarks</h1>
          <p className="text-secondary text-[13px]">{user?.handle}</p>
        </div>
        <button onClick={() => navigate('/settings')} title="Настройки сохранённого" className="p-2 hover:bg-hover rounded-full transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Bookmarks List */}
      <div className="flex flex-col">
        {bookmarkedTweets.length > 0 ? (
          bookmarkedTweets.map(tweet => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))
        ) : (
          <div className="p-10 flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold mb-2">Save posts for later</h2>
            <p className="text-secondary max-w-sm">Bookmark posts to easily find them again in the future.</p>
          </div>
        )}
      </div>
    </div>
  )
}
