import { ArrowLeft, MessageSquare, Zap, Briefcase, Settings, HelpCircle, Palette, Keyboard, ExternalLink, LogOut, ShieldCheck, Bot } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { cn } from '../lib/utils'

const MoreOption = ({ icon: Icon, label, description, onClick, className }) => (
  <div 
    onClick={onClick}
    className={cn(
      "flex items-center gap-4 px-4 py-4 hover:bg-white/5 cursor-pointer transition-colors group",
      className
    )}
  >
    <div className="p-2 bg-white/5 rounded-full group-hover:bg-primary/10 transition-colors">
      <Icon size={22} className="group-hover:text-primary transition-colors" />
    </div>
    <div className="flex-1">
      <div className="font-bold text-[15px] group-hover:text-primary transition-colors">{label}</div>
      {description && <p className="text-secondary text-[13px]">{description}</p>}
    </div>
    {!onClick && <ExternalLink size={16} className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />}
  </div>
)

export default function More() {
  const navigate = useNavigate()
  const { logout, isAdmin, subscribe, donatePayUrl } = useStore()
  const shalterUrl = import.meta.env.VITE_SHALTER_URL || '/shalter'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex-1 border-r border-border min-h-screen max-w-[600px] md:ml-20 xl:ml-64 w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md px-4 py-3 border-b border-border flex items-center gap-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-hover rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">More</h1>
      </div>

      <div className="py-2">
        <h2 className="px-4 py-3 text-secondary text-sm font-bold uppercase tracking-widest">Creator Studio</h2>
        <MoreOption icon={Bot} label="Мои боты" description="Создавайте ботов и управляйте командами" onClick={() => navigate('/bots')} />
        {isAdmin() && <MoreOption icon={ShieldCheck} label="Панель администратора" description="Модерация и управление Bestgram" onClick={() => navigate('/admin')} />}
        <MoreOption onClick={() => navigate(isAdmin() ? '/admin' : '/profile')}
          icon={Zap} 
          label="Статистика" 
          description="Следите за ростом и активностью" 
        />
      </div>

      <div className="border-t border-border py-2">
        <h2 className="px-4 py-3 text-secondary text-sm font-bold uppercase tracking-widest">Professional Tools</h2>
        <MoreOption onClick={() => navigate('/ads')}
          icon={Briefcase} 
          label="Bestgram для бизнеса" 
          description="Управляйте профессиональным профилем" 
        />
        <MoreOption onClick={() => navigate('/ads')}
          icon={MessageSquare} 
          label="Реклама" 
          description="Создайте кампанию и оплатите размещение" 
        />
      </div>

      <div className="border-t border-border py-2">
        <h2 className="px-4 py-3 text-secondary text-sm font-bold uppercase tracking-widest">Приложения</h2>
        <MoreOption icon={ExternalLink} label="Открыть Shalter" description="Мессенджер Shalter связан с Bestgram" onClick={() => window.open(shalterUrl, '_blank', 'noopener,noreferrer')} />
      </div>

      <div className="border-t border-border py-2">
        <h2 className="px-4 py-3 text-secondary text-sm font-bold uppercase tracking-widest">Settings & Support</h2>
        <MoreOption onClick={() => navigate('/settings')} icon={Settings} label="Настройки и конфиденциальность" description="Параметры вида, звуков и уведомлений" />
        <MoreOption onClick={() => navigate('/bots')} icon={HelpCircle} label="Центр помощи" description="Документация и поддержка best-gram" />
        <MoreOption onClick={() => navigate('/settings')} icon={Palette} label="Оформление" description="Настройте вид и анимации" />
        <MoreOption onClick={() => navigate('/settings')} icon={Keyboard} label="Горячие клавиши" description="Быстрый переход к настройкам" />
        <MoreOption 
          icon={LogOut} 
          label="Log out" 
          onClick={handleLogout}
          className="text-red-500 hover:bg-red-500/10"
        />
      </div>

      {/* Premium CTA */}
      <div className="m-4 p-4 rounded-2xl bg-[#0d2b3e] border border-[#28506a]">
        <h2 className="text-xl font-bold mb-2">Bestgram Premium</h2>
        <p className="text-[15px] text-secondary mb-4">
          Больше возможностей, приоритетная поддержка и особый значок профиля.
        </p>
        <div className="flex flex-wrap gap-2"><button onClick={() => subscribe('monthly')} className="bg-[#38e3c1] text-[#06121f] font-bold px-5 py-2.5 rounded-full hover:brightness-110 transition">Подключить подписку</button><a href={donatePayUrl} target="_blank" rel="noreferrer" className="border border-[#5de4ca] text-[#5de4ca] font-bold px-5 py-2.5 rounded-full hover:bg-[#5de4ca]/10 transition">Поддержать через DonatePay</a></div>
      </div>
    </div>
  )
}
