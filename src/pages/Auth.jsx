import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'

const initialForm = { name: '', username: '', phone: '', birthMonth: '', birthDay: '', birthYear: '', password: '' }
const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const getBirthDate = form => form.birthYear && form.birthMonth && form.birthDay ? `${form.birthYear}-${String(form.birthMonth).padStart(2, '0')}-${String(form.birthDay).padStart(2, '0')}` : ''

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [pending, setPending] = useState(false)
  const { login, register, resetPassword } = useStore()
  const update = key => event => setForm(value => ({ ...value, [key]: event.target.value }))
  const isRegister = mode === 'register'
  const isReset = mode === 'reset'
  const switchMode = next => { setMode(next); setError(''); setNotice(''); setForm(initialForm) }

  const submit = async event => {
    event.preventDefault(); if (pending) return; setPending(true); setError(''); setNotice('')
    if (isReset) {
      if (!form.username || !form.phone || form.password.length < 6) { setPending(false); return setError('Заполните username, телефон и новый пароль') }
      if (await resetPassword(form.username, form.phone, form.password)) { setMode('login'); setNotice('Пароль изменён. Теперь войдите с новым паролем.'); setForm(initialForm) } else setError(useStore.getState().authError || 'Не удалось изменить пароль')
      setPending(false)
      return
    }
    if (isRegister) {
      if (form.name.trim().length < 2) { setPending(false); return setError('Введите имя не короче 2 символов') }
      if (!/^[a-z\d_]{3,32}$/i.test(form.username.trim().replace(/^@/, ''))) { setPending(false); return setError('Username: латиница, цифры и _ (3–32 символа)') }
      if (form.phone.replace(/\D/g, '').length < 8) { setPending(false); return setError('Введите номер телефона') }
      if (form.password.length < 6) { setPending(false); return setError('Пароль должен быть не короче 6 символов') }
      if (!await register(form.name.trim(), form.username.trim(), form.password, form.phone.trim(), getBirthDate(form))) setError('Username или телефон уже занят, либо данные указаны неверно')
      setPending(false)
      return
    }
    if (!await login(form.username, form.password)) setError(useStore.getState().authError || 'Проверьте username/телефон и пароль')
    setPending(false)
  }

  const birthFields = <div><label className="block text-sm text-[#91a8bb]">Дата рождения <span className="text-[#71889d]">(необязательно)</span></label><div className="mt-2 grid grid-cols-3 gap-2"><select aria-label="Месяц рождения" value={form.birthMonth} onChange={update('birthMonth')} className="auth-input"><option value="">Месяц</option>{months.map((month, index) => <option value={index + 1} key={month}>{month}</option>)}</select><select aria-label="День рождения" value={form.birthDay} onChange={update('birthDay')} className="auth-input"><option value="">День</option>{Array.from({ length: 31 }, (_, index) => <option value={index + 1} key={index + 1}>{index + 1}</option>)}</select><select aria-label="Год рождения" value={form.birthYear} onChange={update('birthYear')} className="auth-input"><option value="">Год</option>{Array.from({ length: 108 }, (_, index) => { const year = new Date().getFullYear() - 13 - index; return <option value={year} key={year}>{year}</option> })}</select></div></div>

  return <main className="min-h-screen grid lg:grid-cols-[1.1fr_.9fr] bg-[#07111f] overflow-hidden">
    <section className="hidden lg:flex relative items-center p-16 xl:p-24 overflow-hidden bg-gradient-to-br from-[#0d2b3e] via-[#0b1a2c] to-[#07111f]"><div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#21c7a8]/20 blur-3xl" /><div className="absolute -left-24 -bottom-32 h-96 w-96 rounded-full bg-[#159fce]/20 blur-3xl" /><div className="relative max-w-xl"><div className="flex items-center gap-3 mb-12"><div className="brand-mark flex h-12 w-12 items-center justify-center rounded-2xl text-2xl font-black">B</div><span className="text-2xl font-bold">bestgram</span></div><p className="mb-5 text-sm font-bold uppercase tracking-[.25em] text-[#5de4ca]">Твоя лента. Твои люди.</p><h1 className="text-5xl xl:text-7xl font-black leading-[.98] tracking-tight">Общайся ярче.<br /><span className="text-[#5de4ca]">Будь собой.</span></h1><p className="mt-7 max-w-md text-lg leading-8 text-[#a9bdd0]">Публикации, истории, чаты и живое общение в одном месте.</p><div className="mt-12 grid gap-4 text-sm text-[#c8d8e6]"><div className="flex items-center gap-3"><Sparkles size={18} className="text-[#5de4ca]" /> Публикации и истории</div><div className="flex items-center gap-3"><MessageCircle size={18} className="text-[#5de4ca]" /> Чаты в реальном времени</div><div className="flex items-center gap-3"><ShieldCheck size={18} className="text-[#5de4ca]" /> Безопасная сессия и восстановление</div></div></div></section>
    <section className="flex items-center justify-center p-6 sm:p-10"><div className="w-full max-w-md"><div className="mb-8 flex items-center gap-3 lg:hidden"><div className="brand-mark flex h-11 w-11 items-center justify-center rounded-2xl text-xl font-black">B</div><span className="text-2xl font-bold">best-gram</span></div><div className="glass-panel rounded-[2rem] p-7 sm:p-9"><p className="mb-2 text-sm font-semibold text-[#5de4ca]">best-gram</p><h2 className="text-3xl font-black">{isReset ? 'Восстановление' : isRegister ? 'Создай аккаунт' : 'С возвращением!'}</h2><p className="mt-2 text-sm text-[#91a8bb]">{isReset ? 'Для восстановления нужны только username и номер телефона.' : isRegister ? 'Данные сохраняются на сервере.' : 'Войдите по username или номеру телефона.'}</p><form onSubmit={submit} className="mt-7 space-y-4">{isRegister && <><input value={form.name} onChange={update('name')} placeholder="Имя и фамилия" className="auth-input" /><input value={form.username} onChange={update('username')} placeholder="Username без @" className="auth-input" /><input value={form.phone} onChange={update('phone')} placeholder="Номер телефона" type="tel" className="auth-input" /></>}{isReset && <><input value={form.username} onChange={update('username')} placeholder="Username" className="auth-input" /><input value={form.phone} onChange={update('phone')} placeholder="Номер телефона" type="tel" className="auth-input" /></>}{!isRegister && !isReset && <input value={form.username} onChange={update('username')} placeholder="Username или телефон" className="auth-input" />}{isRegister ? birthFields : null}<div className="relative"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder={isReset ? 'Новый пароль' : 'Пароль'} className="auth-input pr-12" /><button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#91a8bb]">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>{error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}{notice && <p className="rounded-xl bg-[#38e3c1]/10 px-3 py-2 text-sm text-[#5de4ca]">{notice}</p>}<button disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#38e3c1] to-[#159fce] py-3.5 font-bold text-[#06121f] disabled:cursor-wait disabled:opacity-60">{pending ? 'Проверяем…' : isReset ? 'Изменить пароль' : isRegister ? 'Создать аккаунт' : 'Войти'} <ArrowRight size={18} /></button></form><div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-[#28445c] pt-6 text-sm text-[#91a8bb]">{!isReset && <button onClick={() => switchMode(isRegister ? 'login' : 'register')} className="font-bold text-[#5de4ca]">{isRegister ? 'Уже есть аккаунт' : 'Зарегистрироваться'}</button>}{!isRegister && <button onClick={() => switchMode(isReset ? 'login' : 'reset')} className="font-bold text-[#5de4ca]">{isReset ? 'Вернуться ко входу' : 'Забыли пароль?'}</button>}</div></div><p className="mt-6 text-center text-xs text-[#71889d]">SMS-подтверждение не используется: храните номер телефона в безопасности.</p></div></section>
  </main>
}
