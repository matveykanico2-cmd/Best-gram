import { useState } from 'react'
import { Settings, Plus, ImagePlus, Smile } from 'lucide-react'
import TweetComposer from './TweetComposer'
import TweetCard from './TweetCard'
import { useStore } from '../store/useStore'
import Avatar from './Avatar'
import { useNavigate } from 'react-router-dom'

export default function Feed() {
  const [tab, setTab] = useState('foryou')
  const [storyComposerOpen, setStoryComposerOpen] = useState(false)
  const [storyText, setStoryText] = useState('')
  const [storyImage, setStoryImage] = useState('')
  const [viewedStory, setViewedStory] = useState(null)
  const tweets = useStore(state => state.tweets)
  const stories = useStore(state => state.stories || [])
  const users = useStore(state => state.users)
  const addStory = useStore(state => state.addStory)
  const navigate = useNavigate()
  
  // Filter only top-level tweets for the main feed
  const feedTweets = tweets.filter(t => !t.parentId)

  return (
    <main className="flex-1 max-w-[600px] min-h-screen border-r border-border md:ml-20 xl:ml-[256px] w-full">
      <header className="sticky top-0 bg-[#07111f]/85 backdrop-blur-md z-10 border-b border-[#1b3046]">
        <div className="flex items-center justify-between px-4 py-3">
          <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#5de4ca]">best-gram</p><h1 className="text-xl font-bold">Главная</h1></div>
          <button onClick={() => navigate('/settings')} title="Настройки ленты" className="p-2 hover:bg-hover rounded-full transition-colors">
            <Settings size={20} />
          </button>
        </div>
        
        <div className="flex w-full">
          <button 
            onClick={() => setTab('foryou')}
            className="flex-1 py-4 hover:bg-hover transition-colors relative"
          >
            <span className={tab === 'foryou' ? 'font-bold' : 'text-secondary'}>Для вас</span>
            {tab === 'foryou' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-primary rounded-full" />}
          </button>
          <button 
            onClick={() => setTab('following')}
            className="flex-1 py-4 hover:bg-hover transition-colors relative"
          >
            <span className={tab === 'following' ? 'font-bold' : 'text-secondary'}>Подписки</span>
            {tab === 'following' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full" />}
          </button>
        </div>
      </header>

      <div className="border-b border-[#1b3046] px-4 py-4">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          <button onClick={() => setStoryComposerOpen(true)} className="group flex w-16 shrink-0 flex-col items-center gap-1 text-xs text-[#91a8bb]"><span className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-[#38e3c1] bg-[#0d1d2f] text-[#38e3c1] transition group-hover:bg-[#122f40]"><Plus size={22} /></span><span>Ваша история</span></button>
          {stories.slice(0, 8).map(story => { const author = users.find(user => user.id === story.authorId || user.id === story.userId); return <button key={story.id} onClick={() => setViewedStory({ ...story, author })} className="group flex w-16 shrink-0 flex-col items-center gap-1 text-xs text-[#91a8bb]"><span className="rounded-full bg-gradient-to-tr from-[#38e3c1] to-[#159fce] p-[2px]"><Avatar src={author?.avatar || story.avatar} name={author?.name || story.name} className="h-[52px] w-[52px] rounded-full border-2 border-[#07111f]" /></span><span className="w-full truncate text-center">{author?.name || story.name}</span></button> })}
        </div>
      </div>

      <TweetComposer />

      <div className="flex flex-col">
        {feedTweets.length > 0 ? (
          feedTweets.map(tweet => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))
        ) : (
          <div className="p-10 text-center">
            <p className="text-secondary">Публикаций пока нет. Будьте первым!</p>
          </div>
        )}
      </div>
      {storyComposerOpen && <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4"><form onSubmit={(event) => { event.preventDefault(); if (storyText.trim()) addStory(storyText, storyImage || null); setStoryText(''); setStoryImage(''); setStoryComposerOpen(false) }} className="story-dialog glass-panel w-full max-w-md rounded-3xl p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-black">Новая история</h2><p className="mt-1 text-sm text-[#91a8bb]">История будет доступна 24 часа.</p></div><button type="button" onClick={() => setStoryComposerOpen(false)} className="rounded-full px-3 py-1 text-xl text-[#91a8bb] hover:bg-[#12263a]">×</button></div><textarea autoFocus value={storyText} onChange={(event) => setStoryText(event.target.value)} maxLength={500} placeholder="Поделитесь моментом..." className="mt-5 min-h-32 w-full resize-none rounded-2xl border border-[#28445c] bg-[#091827] p-4 outline-none focus:border-[#38e3c1]" />{storyImage && <img src={storyImage} alt="Предпросмотр истории" className="mt-3 max-h-56 w-full rounded-2xl object-cover" />}<div className="mt-3 flex items-center gap-2"><label className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#5de4ca] hover:bg-[#12263a]"><ImagePlus size={18} /> Фото<input type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setStoryImage(String(reader.result || '')); reader.readAsDataURL(file) }} /></label><button type="button" onClick={() => setStoryText(value => `${value}${value ? ' ' : ''}✨`)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#f5c451] hover:bg-[#12263a]"><Smile size={18} /> Emoji</button><span className="ml-auto text-xs text-[#71889d]">{storyText.length}/500</span></div><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => { setStoryText(''); setStoryImage(''); setStoryComposerOpen(false) }} className="rounded-xl px-4 py-2 text-[#91a8bb] hover:bg-[#12263a]">Отмена</button><button disabled={!storyText.trim()} className="rounded-xl bg-[#38e3c1] px-4 py-2 font-bold text-[#06121f] disabled:cursor-not-allowed disabled:opacity-50">Опубликовать</button></div></form></div>}
      {viewedStory && <div className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-4" onClick={() => setViewedStory(null)}><div onClick={(event) => event.stopPropagation()} className="story-viewer relative flex min-h-[360px] w-full max-w-sm flex-col justify-end overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0d2b3e] via-[#123d4c] to-[#159fce] p-6 shadow-2xl sm:min-h-[420px] sm:p-7">{viewedStory.image && <img src={viewedStory.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />}<div className="relative z-10"><button onClick={() => setViewedStory(null)} className="absolute bottom-full right-0 mb-6 rounded-full bg-black/30 px-3 py-1 text-xl">×</button><p className="text-sm text-[#c8d8e6]">{viewedStory.author?.name || viewedStory.name}</p><p className="mt-2 text-2xl font-black leading-tight">{viewedStory.text}</p></div></div></div>}
    </main>
  )
}
