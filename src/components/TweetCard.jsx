import { MessageCircle, Repeat2, Heart, BarChart2, Share, MoreHorizontal, Bookmark, Pencil, Trash2, Flag } from 'lucide-react'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useStore } from '../store/useStore'
import { cn } from '../lib/utils'
import VerifiedBadge from './VerifiedBadge'
import Avatar from './Avatar'

import { useNavigate } from 'react-router-dom'

export default function TweetCard({ tweet, isReply = false }) {
  const navigate = useNavigate()
  const users = useStore(state => state.users)
  const activeUserId = useStore(state => state.activeUserId)
  const toggleLike = useStore(state => state.toggleLike)
  const toggleRepost = useStore(state => state.toggleRepost)
  const toggleBookmark = useStore(state => state.toggleBookmark)
  const editTweet = useStore(state => state.editTweet)
  const deleteTweet = useStore(state => state.deleteTweet)
  const reportPost = useStore(state => state.reportPost)
  const bookmarks = useStore(state => state.bookmarks)
  
  const author = users.find(u => u.id === tweet.authorId) || users[0]
  const isLiked = Boolean(tweet.stats.liked || (Array.isArray(tweet.stats.likes) && tweet.stats.likes.includes(activeUserId)))
  const isReposted = Boolean(tweet.stats.reposted || (Array.isArray(tweet.stats.reposts) && tweet.stats.reposts.includes(activeUserId)))
  const likesCount = Array.isArray(tweet.stats.likes) ? tweet.stats.likes.length : Number(tweet.stats.likes || 0)
  const isBookmarked = bookmarks.includes(tweet.id)
  const [menuOpen, setMenuOpen] = useState(false)
  const canManage = tweet.authorId === activeUserId || users.find(user => user.id === activeUserId)?.role === 'admin'

  const formatContent = (content) => {
    return content.split(/(\s+)/).map((word, i) => {
      if (word.startsWith('#')) {
        return <span key={i} className="text-primary hover:underline cursor-pointer" onClick={(e) => e.stopPropagation()}>{word}</span>
      }
      if (word.startsWith('@')) {
        return <span key={i} className="text-primary hover:underline cursor-pointer" onClick={(e) => e.stopPropagation()}>{word}</span>
      }
      return word
    })
  }

  return (
    <div 
      onClick={() => navigate(`/status/${tweet.id}`)}
      className={cn(
        "relative flex gap-3 p-4 border-b border-border hover:bg-white/5 transition-colors cursor-pointer",
        isReply && "border-none pt-0"
      )}
    >
      <div className="flex flex-col items-center shrink-0">
        <div 
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/profile/${author.id}`)
          }}
        >
          <Avatar src={author.avatar} name={author.name} className="w-10 h-10 rounded-full" />
        </div>
        {isReply && <div className="w-0.5 h-full bg-border mt-1" />}
      </div>

      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-1 group/author cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/profile/${author.id}`)
            }}
          >
            <span className="font-bold group-hover/author:underline">{author.name}</span>
            <VerifiedBadge type={author.verifiedType} />
            <span className="text-secondary">{author.handle}</span>
            <span className="text-secondary">·</span>
            <span className="text-secondary hover:underline">
              {formatDistanceToNow(new Date(tweet.timestamp), { addSuffix: false })
                .replace('about ', '')
                .replace(' hours', 'h')
                .replace(' minutes', 'm')
                .replace(' minute', 'm')
                .replace(' seconds', 's')
              }
            </span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen(value => !value) }} className="text-secondary p-2 hover:bg-primary/10 hover:text-primary rounded-full transition-colors">
            <MoreHorizontal size={18} />
          </button>
          {menuOpen && <div className="absolute right-4 top-12 z-20 w-48 rounded-2xl border border-[#28445c] bg-[#0d1d2f] p-1 shadow-2xl" onClick={e => e.stopPropagation()}>{canManage ? <><button onClick={async () => { const content = window.prompt('Изменить публикацию', tweet.content); if (content?.trim()) { await editTweet(tweet.id, content.trim()); setMenuOpen(false) } }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-white/10"><Pencil size={15} /> Изменить</button><button onClick={async () => { if (window.confirm('Удалить публикацию?')) { await deleteTweet(tweet.id); setMenuOpen(false) } }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10"><Trash2 size={15} /> Удалить</button></> : <button onClick={async () => { const reason = window.prompt('Причина жалобы', 'Нарушение правил'); if (reason?.trim() && await reportPost(tweet.id, reason)) { setMenuOpen(false); window.alert('Жалоба отправлена модераторам') } }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-white/10"><Flag size={15} /> Пожаловаться</button>}</div>}
        </div>

        <div className="text-[15px] leading-normal whitespace-pre-wrap break-words">
          {formatContent(tweet.content)}
        </div>

        {tweet.image && (
          <div className="mt-3 rounded-2xl border border-border overflow-hidden max-h-[512px] bg-black">
            <img 
              src={tweet.image} 
              alt="Tweet content" 
              className="w-full h-full object-contain"
            />
          </div>
        )}

        <div className="flex items-center justify-between mt-3 max-w-md text-secondary -ml-2">
          <button onClick={(e) => { e.stopPropagation(); navigate(`/status/${tweet.id}`) }} className="group flex items-center gap-2 hover:text-primary transition-colors">
            <div className="p-2 group-hover:bg-primary/10 rounded-full transition-colors">
              <MessageCircle size={18} />
            </div>
            <span className="text-sm">{tweet.stats.replies.length || ''}</span>
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); toggleRepost(tweet.id); }}
            className={cn(
              "group flex items-center gap-2 hover:text-green-500 transition-colors",
              isReposted && "text-green-500"
            )}
          >
            <div className="p-2 group-hover:bg-green-500/10 rounded-full transition-colors">
              <Repeat2 size={18} />
            </div>
            <span className="text-sm">{(Array.isArray(tweet.stats.reposts) ? tweet.stats.reposts.length : Number(tweet.stats.reposts || 0)) || ''}</span>
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); toggleLike(tweet.id); }}
            className={cn(
              "group flex items-center gap-2 hover:text-pink-500 transition-colors",
              isLiked && "text-pink-500"
            )}
          >
            <div className="p-2 group-hover:bg-pink-500/10 rounded-full transition-colors">
              <Heart size={18} className={cn(isLiked && "fill-pink-500")} />
            </div>
            <span className="text-sm">{likesCount || ''}</span>
          </button>

          <button onClick={(e) => { e.stopPropagation(); navigate(`/status/${tweet.id}`) }} className="group flex items-center gap-2 hover:text-primary transition-colors">
            <div className="p-2 group-hover:bg-primary/10 rounded-full transition-colors">
              <BarChart2 size={18} />
            </div>
            <span className="text-sm">{tweet.stats.views.toLocaleString()}</span>
          </button>

          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleBookmark(tweet.id); }}
              className={cn(
                "group flex items-center hover:text-primary transition-colors",
                isBookmarked && "text-primary"
              )}
            >
              <div className="p-2 group-hover:bg-primary/10 rounded-full transition-colors">
                <Bookmark size={18} className={cn(isBookmarked && "fill-primary")} />
              </div>
            </button>

            <button onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(`${window.location.origin}/status/${tweet.id}`) }} title="Скопировать ссылку" className="group flex items-center hover:text-primary transition-colors">
              <div className="p-2 group-hover:bg-primary/10 rounded-full transition-colors">
                <Share size={18} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
