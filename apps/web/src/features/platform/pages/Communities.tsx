import { useQuery } from '@tanstack/react-query';
import { UsersRound } from 'lucide-react';
import { platformApi } from '../platform.api';

export default function Communities() {
  const query = useQuery({ queryKey: ['communities'], queryFn: platformApi.communities });
  const items = query.data?.communities || [];
  return <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8"><header className="mb-8 flex items-center gap-3"><UsersRound className="text-purple-300" /><div><h1 className="text-3xl font-semibold">Communities</h1><p className="text-sm text-neutral-500">Живые сообщества из PostgreSQL</p></div></header>{query.isLoading ? <p className="text-neutral-500">Загрузка…</p> : <div className="grid gap-4 sm:grid-cols-2">{items.map((item: { id: string; name: string; description: string }) => <article key={item.id} className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5"><h2 className="text-lg font-medium">{item.name}</h2><p className="mt-2 text-sm text-neutral-400">{item.description || 'Без описания'}</p><button className="mt-5 rounded-xl bg-white px-4 py-2 text-sm text-black">Вступить</button></article>)}{!items.length && !query.isLoading ? <p className="text-neutral-500">Пока нет сообществ.</p> : null}</div>}</main>;
}
