import { useQuery } from '@tanstack/react-query';
import { Video } from 'lucide-react';
import { platformApi } from '../platform.api';

export default function Videos() {
  const query = useQuery({ queryKey: ['videos'], queryFn: platformApi.videos });
  return <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8"><header className="mb-8 flex items-center gap-3"><Video className="text-pink-300" /><div><h1 className="text-3xl font-semibold">Videos</h1><p className="text-sm text-neutral-500">Видео-каталог Nexora</p></div></header><div className="grid gap-4 sm:grid-cols-2">{(query.data?.videos || []).map((video: { id: string; title: string; description: string }) => <article key={video.id} className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5"><h2 className="font-medium">{video.title}</h2><p className="mt-2 text-sm text-neutral-400">{video.description}</p></article>)}{!query.isLoading && !(query.data?.videos || []).length ? <p className="text-neutral-500">Видео пока нет.</p> : null}</div></main>;
}
