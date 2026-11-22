import { ArrowLeft, MoreHorizontal, FilePlus, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

const ListItem = ({ list, isDiscover = false }) => {
  const navigate = useNavigate()
  return (
    <div 
      onClick={() => navigate(`/lists/${list.id}`)}
      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors group"
    >
    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
      <img src={list.banner} alt={list.name} className="w-full h-full object-cover" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1">
        <span className="font-bold truncate group-hover:underline">{list.name}</span>
      </div>
      <div className="flex items-center gap-1 text-secondary text-[13px]">
        <span>{list.members} members</span>
        <span>·</span>
        <span>{list.followers} followers</span>
      </div>
    </div>
    {isDiscover ? (
      <button className="bg-white text-black font-bold px-4 py-1.5 rounded-full text-sm hover:bg-white/90 transition-colors">
        Follow
      </button>
    ) : (
      <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-full transition-colors">
        <UserPlus size={18} />
      </button>
    )}
    </div>
  )
}

export default function Lists() {
  const navigate = useNavigate()
  const { lists, users, activeUserId } = useStore()
  const user = users.find(u => u.id === activeUserId)

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
            <h1 className="text-xl font-bold">Списки</h1>
            <p className="text-secondary text-[13px]">{user?.handle}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => navigate('/communities')} title="Создать список через группы" className="p-2 hover:bg-hover rounded-full transition-colors">
            <FilePlus size={20} />
          </button>
          <button onClick={() => navigate('/settings')} title="Настройки списков" className="p-2 hover:bg-hover rounded-full transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Pinned Lists */}
      <div className="border-b border-border p-4">
        <h2 className="text-xl font-bold mb-8">Pinned Lists</h2>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-secondary text-[15px]">Здесь пока ничего нет — закрепите любимые списки, чтобы быстро находить их.</p>
        </div>
      </div>

      {/* Discover New Lists */}
      <div className="border-b border-border py-2">
        <h2 className="px-4 py-3 text-xl font-bold">Discover new Lists</h2>
        {lists.map(list => (
          <ListItem key={list.id} list={list} isDiscover />
        ))}
        {!lists.length && <div className="px-4 pb-5 text-sm text-secondary">Списков пока нет.</div>}
      </div>

      {/* Your Lists */}
      <div className="py-2">
        <h2 className="px-4 py-3 text-xl font-bold">Your Lists</h2>
        <div className="flex flex-col items-center justify-center py-10 text-center px-10">
          <p className="text-secondary text-[15px]">Вы ещё не создали и не подписались ни на один список.</p>
        </div>
      </div>
    </div>
  )
}
