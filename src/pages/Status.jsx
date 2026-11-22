import { ArrowLeft } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import TweetCard from '../components/TweetCard'
import TweetComposer from '../components/TweetComposer'

export default function Status() {
  const { id } = useParams()
  const navigate = useNavigate()
  const tweets = useStore(state => state.tweets)
  
  const tweet = tweets.find(t => t.id === id)
  const replies = tweets.filter(t => t.parentId === id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  if (!tweet) {
    return (
      <div className="flex-1 max-w-[600px] border-r border-border ml-20 xl:ml-[256px] p-4 text-center">
        Tweet not found.
      </div>
    )
  }

  return (
    <main className="flex-1 max-w-[600px] min-h-screen border-r border-border ml-20 xl:ml-[256px]">
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-border flex items-center gap-6 px-4 py-2">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-hover rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Post</h1>
      </header>

      <div className="border-b border-border">
        <TweetCard tweet={tweet} />
      </div>

      <TweetComposer parentId={tweet.id} />

      <div className="flex flex-col pb-20">
        {replies.map(reply => (
          <TweetCard key={reply.id} tweet={reply} />
        ))}
      </div>
    </main>
  )
}
