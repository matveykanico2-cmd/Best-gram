import { Settings as SettingsIcon, ShieldCheck } from 'lucide-react';

export default function Settings() {
  return <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8"><header className="mb-8 flex items-center gap-3"><SettingsIcon className="text-neutral-300" /><div><h1 className="text-3xl font-semibold">Настройки</h1><p className="text-sm text-neutral-500">Сессия защищена HttpOnly cookie</p></div></header><section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5"><div className="flex items-start gap-3"><ShieldCheck className="mt-1 text-emerald-300" /><div><h2 className="font-medium">Безопасность аккаунта</h2><p className="mt-2 text-sm text-neutral-400">Пароли хранятся с bcrypt, API ограничивает частоту запросов, а маршруты проверяют пользователя и роль.</p></div></div></section></main>;
}
