import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MoreHorizontal, Share } from 'lucide-react'
import { useStore } from '../store/useStore'
import TweetCard from '../components/TweetCard'

export default function ListDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { lists, tweets } = useStore()
  
  const list = lists.find(l => l.id === id)
  
  if (!list) return null

  // Filter tweets from list members
  const memberIds = list.memberIds || []
  const listTweets = tweets.filter(t => memberIds.includes(t.authorId))

  return (
    <div className="flex-1 border-r border-border min-h-screen max-w-[600px] md:ml-20 xl:ml-64 w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md px-4 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-hover rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">{list.name}</h1>
            <p className="text-secondary text-[13px]">{list.members} members</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => navigator.clipboard?.writeText(window.location.href)} title="Скопировать ссылку" className="p-2 hover:bg-hover rounded-full transition-colors">
            <Share size={20} />
          </button>
          <button onClick={() => navigate('/settings')} title="Настройки списка" className="p-2 hover:bg-hover rounded-full transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* List Banner & Info */}
      <div className="relative aspect-[3/1] bg-border overflow-hidden">
        <img src={list.banner} alt={list.name} className="w-full h-full object-cover" />
      </div>

      <div className="p-4 border-b border-border text-center">
        <h2 className="text-xl font-bold">{list.name}</h2>
        <p className="text-secondary mt-1">{list.description}</p>
        <div className="flex items-center justify-center gap-4 mt-3 text-sm">
          <span><span className="font-bold text-white">{list.members}</span> <span className="text-secondary">Members</span></span>
          <span><span className="font-bold text-white">{list.followers}</span> <span className="text-secondary">Followers</span></span>
        </div>
        <div className="flex justify-center mt-4">
          <button onClick={() => navigate('/settings')} className="bg-white text-black font-bold px-4 py-2 rounded-full hover:bg-white/90 transition-colors">
            Настройки списка
          </button>
        </div>
      </div>

      {/* Feed */}
      <div>
        {listTweets.length > 0 ? (
          listTweets.map(tweet => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))
        ) : (
          <div className="p-8 text-center text-secondary">
            No posts in this List yet.
          </div>
        )}
      </div>
    </div>
  )
}
