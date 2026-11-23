import { useQuery } from '@tanstack/react-query';
import { PhoneCall } from 'lucide-react';
import { platformApi } from '../platform.api';

export default function Calls() {
  const query = useQuery({ queryKey: ['calls'], queryFn: platformApi.calls });
  return <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8"><header className="mb-8 flex items-center gap-3"><PhoneCall className="text-sky-300" /><div><h1 className="text-3xl font-semibold">Calls</h1><p className="text-sm text-neutral-500">История голосовых и видеозвонков</p></div></header><div className="space-y-3">{(query.data?.calls || []).map((call: { id: string; kind: string; status: string; startedAt: string }) => <div key={call.id} className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4"><span>{call.kind === 'video' ? 'Видеозвонок' : 'Аудиозвонок'}</span><span className="text-sm text-neutral-500">{call.status} · {new Date(call.startedAt).toLocaleString()}</span></div>)}{!query.isLoading && !(query.data?.calls || []).length ? <p className="text-neutral-500">История звонков пуста.</p> : null}</div></main>;
}
