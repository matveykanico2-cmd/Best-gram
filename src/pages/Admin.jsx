import { useEffect, useMemo, useState } from 'react'
import { ShieldCheck, Trash2, BadgeCheck, ArrowLeft, ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { api } from '../lib/api'

export default function Admin() {
  const navigate = useNavigate()
  const { users, tweets, activeUserId, isAdmin, adminSetVerified, adminRevokeVerified, adminDeleteTweet, donatePayUrl } = useStore()
  const allowed = isAdmin()
  const [ads, setAds] = useState([])
  const [reports, setReports] = useState([])
  const [remoteStats, setRemoteStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const loadModeration = async () => {
    if (!allowed) return
    setLoading(true)
    setLoadError('')
    try {
      const [adsResult, reportsResult, statsResult] = await Promise.all([
        api('/api/admin/ads'),
        api('/api/admin/reports'),
        api('/api/admin/stats'),
      ])
      setAds(adsResult.ads || [])
      setReports(reportsResult.reports || [])
      setRemoteStats(statsResult)
    } catch (error) {
      setLoadError(error.message || 'Не удалось загрузить данные модерации')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { void loadModeration() }, [allowed])
  const moderateAd = async (id, status) => { try { await api(`/api/admin/ads/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); setAds(value => value.map(ad => ad.id === id ? { ...ad, status } : ad)) } catch (error) { setLoadError(error.message || 'Не удалось изменить рекламу') } }
  const moderateReport = async (id, status) => { try { await api(`/api/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); setReports(value => value.map(report => report.id === id ? { ...report, status } : report)) } catch (error) { setLoadError(error.message || 'Не удалось изменить жалобу') } }
  const admin = users.find(user => user.id === activeUserId)
  const stats = useMemo(() => ({ users: users.length, posts: tweets.length, verified: users.filter(user => user.verified).length }), [users, tweets])

  if (!allowed) return <main className="flex min-h-screen flex-1 items-center justify-center px-6 md:ml-20 xl:ml-64"><div className="glass-panel max-w-md rounded-3xl p-8 text-center"><ShieldCheck className="mx-auto mb-4 text-[#5de4ca]" size={42} /><h1 className="text-2xl font-black">Доступ закрыт</h1><p className="mt-2 text-[#91a8bb]">Раздел доступен только администратору Bestgram.</p><button onClick={() => navigate('/')} className="mt-6 rounded-2xl bg-[#38e3c1] px-5 py-3 font-bold text-[#06121f]">На главную</button></div></main>

  return <main className="flex-1 min-h-screen max-w-[820px] border-r border-[#1b3046] md:ml-20 xl:ml-64">
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-[#1b3046] bg-[#07111f]/85 px-4 py-3 backdrop-blur-xl"><button onClick={() => navigate(-1)} className="rounded-xl p-2 hover:bg-[#12263a]"><ArrowLeft size={20} /></button><div><p className="text-xs uppercase tracking-[.18em] text-[#5de4ca]">Панель управления</p><h1 className="text-xl font-black">Администрирование</h1></div></header>
    <div className="space-y-6 p-4 sm:p-6">
      <section className="grid gap-3 sm:grid-cols-4">{[['Пользователи', remoteStats?.users ?? stats.users], ['Публикации', remoteStats?.posts ?? stats.posts], ['Истории', remoteStats?.stories ?? stats.stories ?? 0], ['С галочкой', stats.verified]].map(([label, value]) => <div key={label} className="glass-panel rounded-2xl p-4"><p className="text-sm text-[#91a8bb]">{label}</p><p className="mt-1 text-3xl font-black">{value}</p></div>)}</section>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#20344b] bg-[#091827] px-4 py-3 text-sm"><span className="text-[#91a8bb]">{loading ? 'Обновляем данные…' : 'Данные модерации загружены'}</span><button onClick={() => void loadModeration()} disabled={loading} className="flex items-center gap-2 rounded-xl border border-[#28445c] px-3 py-2 font-bold disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Обновить</button></div>
      {loadError ? <div role="alert" className="flex items-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"><AlertTriangle size={18} />{loadError}</div> : null}
      <section className="glass-panel rounded-3xl p-5"><div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-bold">Профиль администратора</h2><p className="mt-1 text-sm text-[#91a8bb]">{admin?.phone} · {admin?.handle}</p></div><BadgeCheck className="text-[#f5c451]" size={34} /></div></section>
      <section className="glass-panel rounded-3xl p-5"><h2 className="mb-4 text-lg font-bold">Управление пользователями</h2><div className="divide-y divide-[#20344b]">{users.filter(user => user.id !== activeUserId && user.role !== 'bot').map(user => <div key={user.id} className="flex flex-wrap items-center gap-3 py-3"><img src={user.avatar} alt="" className="h-10 w-10 rounded-full" /><div className="min-w-0 flex-1"><p className="truncate font-bold">{user.name}</p><p className="truncate text-sm text-[#91a8bb]">{user.handle}</p></div><select value={user.verified ? user.verifiedType || 'blue' : 'none'} onChange={e => e.target.value === 'none' ? adminRevokeVerified(user.id) : adminSetVerified(user.id, e.target.value)} className="rounded-xl border border-[#28445c] bg-[#091827] px-3 py-2 text-sm"><option value="none">Без галочки</option><option value="blue">Синяя</option><option value="gold">Золотая</option><option value="gray">Серая</option></select></div>)}</div></section>
      <section className="glass-panel rounded-3xl p-5"><div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-bold">Поддержка проекта</h2><p className="mt-1 text-sm text-[#91a8bb]">Платёжная страница DonatePay настраивается через VITE_DONATEPAY_URL.</p></div><a href={donatePayUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-[#38e3c1] px-4 py-2 font-bold text-[#06121f]">Открыть DonatePay <ExternalLink size={16} /></a></div></section>
      <section className="glass-panel rounded-3xl p-5"><h2 className="mb-4 text-lg font-bold">Последние публикации</h2><div className="space-y-2">{tweets.slice(0, 10).map(tweet => <div key={tweet.id} className="flex items-center gap-3 rounded-2xl bg-[#091827] p-3"><p className="line-clamp-2 flex-1 text-sm">{tweet.content}</p><button onClick={() => adminDeleteTweet(tweet.id)} title="Удалить публикацию" className="rounded-xl p-2 text-red-300 hover:bg-red-500/10"><Trash2 size={18} /></button></div>)}</div></section>
      <section className="glass-panel rounded-3xl p-5"><h2 className="mb-4 text-lg font-bold">Модерация рекламы</h2>{ads.length ? <div className="space-y-3">{ads.map(ad => <div key={ad.id} className="rounded-2xl border border-[#20344b] p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-bold">{ad.title}</p><p className="text-sm text-[#91a8bb]">{ad.ownerName} · {ad.budget} ₽ · {ad.status}</p><p className="mt-1 text-sm">{ad.text}</p></div><div className="flex gap-2"><button onClick={() => moderateAd(ad.id, 'active')} className="rounded-xl bg-[#38e3c1] px-3 py-2 text-xs font-bold text-[#06121f]">Одобрить</button><button onClick={() => moderateAd(ad.id, 'rejected')} className="rounded-xl border border-red-400/40 px-3 py-2 text-xs text-red-300">Отклонить</button></div></div></div>)}</div> : <p className="text-sm text-[#91a8bb]">Заявок на рекламу нет.</p>}</section>
      <section className="glass-panel rounded-3xl p-5"><div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold">Жалобы пользователей</h2><p className="mt-1 text-sm text-[#91a8bb]">Проверяйте жалобы на пользователей, публикации и сообщения.</p></div><span className="rounded-full bg-red-400/10 px-3 py-1 text-xs font-bold text-red-200">{reports.filter(report => report.status === 'open').length} открыто</span></div>{reports.length ? <div className="space-y-3">{reports.map(report => <div key={report.id} className="rounded-2xl border border-[#20344b] p-3"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="font-bold">{report.targetType} · {report.targetId}</p><p className="text-sm text-[#91a8bb]">От {report.reporterName || report.reporterUsername || 'пользователя'} · {report.status}</p><p className="mt-1 text-sm">{report.reason}</p></div><div className="flex gap-2"><button onClick={() => moderateReport(report.id, 'reviewed')} disabled={report.status === 'reviewed'} className="rounded-xl border border-[#28445c] px-3 py-2 text-xs font-bold disabled:opacity-50">На проверке</button><button onClick={() => moderateReport(report.id, 'closed')} disabled={report.status === 'closed'} className="rounded-xl bg-[#38e3c1] px-3 py-2 text-xs font-bold text-[#06121f] disabled:opacity-50">Закрыть</button></div></div></div>)}</div> : <p className="text-sm text-[#91a8bb]">Жалоб нет.</p>}</section>
    </div>
  </main>
}
