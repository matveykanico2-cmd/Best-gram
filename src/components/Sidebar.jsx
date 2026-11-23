import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Home, Compass, Bell, Mail, Bookmark, List, User, MoreHorizontal, Plus, Users, LogOut } from 'lucide-react'
import { cn } from '../lib/utils'
import { useStore } from '../store/useStore'
import Avatar from './Avatar'

const items = [[Home, 'Лента', '/'], [Compass, 'Обзор', '/explore'], [Bell, 'Уведомления', '/notifications'], [Mail, 'Сообщения', '/messages'], [Bookmark, 'Сохранённое', '/bookmarks'], [List, 'Списки', '/lists'], [Users, 'Сообщества', '/communities'], [User, 'Профиль', '/profile'], [MoreHorizontal, 'Ещё', '/more']]
const SidebarItem = ({ icon: Icon, label, to }) => <NavLink to={to} end={to === '/'} className={({ isActive }) => cn('group flex items-center gap-4 rounded-2xl px-3 py-3 transition hover:bg-[#12263a]', isActive && 'bg-[#12263a] text-[#5de4ca]')}><Icon size={21} /><span className="hidden xl:inline text-[15px] font-semibold">{label}</span></NavLink>

export default function Sidebar() {
  const { setIsComposeModalOpen, users, activeUserId, logout } = useStore()
  const user = users.find(u => u.id === activeUserId)
  return <>
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-20 flex-col border-r border-[#1b3046] bg-[#07111f]/90 px-3 py-5 backdrop-blur-xl xl:w-64 md:flex">
      <Link to="/" className="mb-8 flex items-center gap-3 px-3"><img src="/best-gram-mark.svg" alt="best-gram" className="brand-mark h-10 w-10 rounded-xl" /><span className="hidden xl:inline text-xl font-black tracking-tight">best-gram</span></Link>
      <nav className="space-y-1">{items.map(([icon, label, to]) => <SidebarItem key={to} icon={icon} label={label} to={to} />)}</nav>
      <button onClick={() => setIsComposeModalOpen(true)} className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#38e3c1] to-[#159fce] px-4 py-3 font-bold text-[#06121f] transition hover:brightness-110"><Plus size={21} /><span className="hidden xl:inline">Новая публикация</span></button>
      <div className="mt-auto rounded-2xl bg-[#0d1d2f] p-3"><div className="flex items-center gap-3"><Avatar src={user?.avatar} name={user?.name} className="h-9 w-9 rounded-full" /><div className="hidden min-w-0 flex-1 xl:block"><p className="truncate text-sm font-bold">{user?.name}</p><p className="truncate text-xs text-[#91a8bb]">{user?.handle}</p></div><button onClick={logout} title="Выйти" className="text-[#91a8bb] hover:text-white"><LogOut size={17} /></button></div></div>
    </aside>
    <nav aria-label="Основная навигация" className="mobile-nav fixed bottom-0 left-0 right-0 z-50 flex items-start gap-1 overflow-x-auto border-t border-[#1b3046] bg-[#07111f]/95 px-2 pt-2 backdrop-blur-xl md:hidden">
      {items.map(([icon, label, to]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => cn('mobile-nav-item flex h-11 min-w-12 shrink-0 items-center justify-center rounded-xl p-2', isActive ? 'text-[#5de4ca] bg-[#12263a]' : 'text-[#91a8bb]')} aria-label={label} title={label}>{React.createElement(icon, { size: 21 })}</NavLink>)}
      <button onClick={() => setIsComposeModalOpen(true)} aria-label="Новая публикация" title="Новая публикация" className="brand-mark mobile-nav-item flex h-11 min-w-12 shrink-0 items-center justify-center rounded-2xl p-2 text-[#06121f]"><Plus size={22} /></button>
    </nav>
  </>
}
