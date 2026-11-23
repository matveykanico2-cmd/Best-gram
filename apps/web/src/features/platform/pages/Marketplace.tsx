import { useQuery } from '@tanstack/react-query';
import { ShoppingBag } from 'lucide-react';
import { platformApi } from '../platform.api';

export default function Marketplace() {
  const query = useQuery({ queryKey: ['marketplace'], queryFn: platformApi.marketplace });
  return <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8"><header className="mb-8 flex items-center gap-3"><ShoppingBag className="text-emerald-300" /><div><h1 className="text-3xl font-semibold">Marketplace</h1><p className="text-sm text-neutral-500">Объявления загружаются с API</p></div></header><div className="grid gap-4 sm:grid-cols-2">{(query.data?.listings || []).map((item: { id: string; title: string; description: string; priceCents: number }) => <article key={item.id} className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5"><h2 className="font-medium">{item.title}</h2><p className="mt-2 text-sm text-neutral-400">{item.description}</p><p className="mt-5 text-xl font-semibold">{(item.priceCents / 100).toFixed(2)} ₽</p></article>)}{!query.isLoading && !(query.data?.listings || []).length ? <p className="text-neutral-500">Объявлений пока нет.</p> : null}</div></main>;
}
