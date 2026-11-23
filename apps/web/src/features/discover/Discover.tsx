import { useEffect, useState } from "react";
import { Bot, Compass, Plus, Radio, X } from "lucide-react";
import axios from "axios";

export default function Discover() {
  const [data, setData] = useState({ channels: [], bots: [] });
  const [tab, setTab] = useState("channels");
  const [creating, setCreating] = useState(null);
  const [form, setForm] = useState({ title: "", name: "", username: "", description: "" });
  const [error, setError] = useState("");

  const load = () => axios.get("/api/discover").then((response) => setData(response.data)).catch(() => setError("Не удалось загрузить разделы"));
  useEffect(() => { void load(); }, []);

  const create = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await axios.post(`/api/discover/${creating}`, creating === "channels" ? { title: form.title, description: form.description } : { name: form.name, username: form.username, description: form.description });
      setCreating(null); setForm({ title: "", name: "", username: "", description: "" }); await load();
    } catch (requestError) { setError(requestError.response?.data?.error || "Не удалось создать"); }
  };

  const items = data[tab] || [];
  return <main className="min-h-screen w-full max-w-3xl px-4 pb-28 pt-6 sm:px-8 md:pt-10">
    <header className="mb-6 flex items-center justify-between"><div><p className="text-sm font-medium text-purple-300">Открывай новое</p><h1 className="text-3xl font-semibold tracking-tight">Сообщества</h1></div><Compass className="h-8 w-8 text-purple-400" /></header>
    <div className="mb-6 flex gap-2 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-1"><button onClick={() => setTab("channels")} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm ${tab === "channels" ? "bg-purple-600 text-white" : "text-neutral-400"}`}><Radio className="h-4 w-4" /> Каналы</button><button onClick={() => setTab("bots")} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm ${tab === "bots" ? "bg-purple-600 text-white" : "text-neutral-400"}`}><Bot className="h-4 w-4" /> Боты</button></div>
    <div className="grid gap-3">{items.length ? items.map((item) => <article key={item._id} className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4"><div className="flex items-start gap-3"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-purple-500/30 to-pink-500/20 text-purple-200">{tab === "channels" ? <Radio /> : <Bot />}</div><div className="min-w-0 flex-1"><h2 className="font-semibold text-white">{item.title || item.name}</h2><p className="text-sm text-neutral-400">{tab === "bots" ? `@${item.username}` : `${item.subscribers?.length || 0} подписчиков`}</p>{item.description ? <p className="mt-2 text-sm text-neutral-300">{item.description}</p> : null}</div><button className="rounded-xl bg-purple-600/20 px-3 py-2 text-sm text-purple-200">Открыть</button></div></article>) : <div className="rounded-3xl border border-dashed border-neutral-800 px-5 py-16 text-center text-neutral-500">Пока здесь пусто. Создай первый объект.</div>}</div>
    <button onClick={() => setCreating(tab)} className="fixed bottom-24 right-5 z-40 flex items-center gap-2 rounded-full bg-purple-600 px-5 py-3 font-semibold text-white shadow-xl shadow-purple-900/30 md:bottom-8 md:right-8"><Plus className="h-5 w-5" /> Создать</button>
    {creating ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 backdrop-blur-sm"><form onSubmit={create} className="relative w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-950 p-6"><button type="button" onClick={() => setCreating(null)} className="absolute right-4 top-4 text-neutral-400"><X /></button><h2 className="mb-5 text-xl font-semibold">{creating === "channels" ? "Новый канал" : "Новый бот"}</h2>{creating === "channels" ? <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Название канала" className="mb-3 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-purple-500" /> : <><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Имя бота" className="mb-3 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-purple-500" /><input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="username бота" className="mb-3 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-purple-500" /></>}<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Описание" rows={3} className="mb-3 w-full resize-none rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-purple-500" />{error ? <p className="mb-3 text-sm text-red-300">{error}</p> : null}<button className="w-full rounded-xl bg-purple-600 py-3 font-semibold text-white">Создать</button></form></div> : null}
  </main>;
}
