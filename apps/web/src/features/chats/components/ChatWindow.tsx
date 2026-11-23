import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useChat } from "../hooks/useChat";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "motion/react";
import { Send, ArrowLeft, Paperclip, ClipboardList, X } from "lucide-react";

const ChatWindow = ({ socketRef, onBack }) => {
  const { handleGetMessages } = useChat();
  const currentChatId = useSelector((state) => state.chats.currentChatId);
  const chatUser = useSelector((state) =>
    currentChatId ? state.chats.chats[currentChatId] : null
  );
  const loggedInUser = useSelector((state) => state.auth.user);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [pollDraft, setPollDraft] = useState(null);
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    const onMessageError = (event) => setSendError(String(event.detail || "Не удалось отправить сообщение"));
    window.addEventListener("nexora:message-error", onMessageError);
    return () => window.removeEventListener("nexora:message-error", onMessageError);
  }, []);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load message history when chat user changes
  useEffect(() => {
    if (currentChatId) {
      handleGetMessages(currentChatId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChatId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatUser?.messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (currentChatId) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [currentChatId]);

  function handleSend() {
    const trimmed = message.trim();
    const poll = pollDraft && pollDraft.question.trim() && pollDraft.options.filter((option) => option.trim()).length >= 2
      ? { question: pollDraft.question.trim(), options: pollDraft.options.filter((option) => option.trim()), multiple: false }
      : null;
    if (pollDraft && !poll) {
      setSendError("Заполните вопрос и минимум два варианта");
      return;
    }
    if ((!trimmed && !attachments.length && !poll) || !socketRef.current || !currentChatId) return;
    setSendError("");

    socketRef.current.emit("send_message", {
      message: trimmed,
      receiver: currentChatId,
      media: attachments.map((item) => ({ url: item.url, type: item.type })),
      poll,
    });

    setMessage("");
    setAttachments([]);
    setPollDraft(null);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!chatUser) return null;

  const messages = chatUser.messages || [];

  // Format timestamp
  function formatTime(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col h-full w-full"
    >
      {/* ── Chat Header ── */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-neutral-800/60 bg-neutral-950/60 backdrop-blur-xl shrink-0">
        {/* Back button (mobile) */}
        <button
          onClick={onBack}
          className="md:hidden p-2 -ml-2 rounded-xl hover:bg-white/5 text-neutral-400 hover:text-white transition-colors"
          aria-label="Back to users"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="w-11 h-11 rounded-full bg-neutral-800 border-2 border-neutral-700 overflow-hidden shrink-0">
          <img
            src={
              chatUser.profilePicture ||
              `https://api.dicebear.com/9.x/bottts/svg?seed=${chatUser.username}`
            }
            alt={chatUser.username}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-white font-medium text-[16px]">
            {chatUser.username}
          </span>
          <span className="text-neutral-500 text-[14px]">Direct message</span>
        </div>
      </div>

      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-3 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
            <div className="w-16 h-16 rounded-full bg-neutral-800/60 border border-neutral-700/50 flex items-center justify-center">
              <img
                src={
                  chatUser.profilePicture ||
                  `https://api.dicebear.com/9.x/bottts/svg?seed=${chatUser.username}`
                }
                alt={chatUser.username}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <p className="text-neutral-500 text-sm">
              Say hi to <span className="text-neutral-300">{chatUser.username}</span>
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isSender =
                msg.sender === loggedInUser?.id ||
                msg.sender === loggedInUser?._id;

              return (
                <motion.div
                  key={msg._id || index}
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                  className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] md:max-w-[60%] px-4 py-2.5 rounded-2xl ${
                      isSender
                        ? "bg-purple-600/90 text-white rounded-br-md"
                        : "bg-neutral-800/80 text-neutral-100 rounded-bl-md"
                    }`}
                  >
                    {msg.media?.map((item) => item.type === "video" ? <video key={item.url} src={item.url} controls className="mb-2 max-h-64 max-w-full rounded-xl" /> : <img key={item.url} src={item.url} alt="Вложение" className="mb-2 max-h-64 max-w-full rounded-xl object-cover" />)}
                    {msg.poll ? (
                      <div className="mb-2 min-w-56 rounded-xl border border-white/10 bg-black/20 p-3">
                        <p className="mb-3 font-medium">{msg.poll.question}</p>
                        <div className="space-y-2">
                          {msg.poll.options.map((option, optionIndex) => (
                            <button key={`${msg._id}-${optionIndex}`} type="button" onClick={() => socketRef.current?.emit("vote_poll", { messageId: msg._id, optionIndex })} className="flex w-full items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-left text-sm hover:border-purple-400/60">
                              <span>{option.text}</span><span className="ml-3 text-xs text-neutral-400">{option.votes || 0}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <p className="text-[15px] leading-relaxed wrap-break-word whitespace-pre-wrap">
                      {msg.content}
                    </p>
                    <p
                      className={`text-[10px] mt-1.5 ${
                        isSender
                          ? "text-purple-200/60"
                          : "text-neutral-500"
                      } text-right`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Message Input ── */}
      <div className="shrink-0 px-5 pb-5 pt-3">
        {sendError ? <p role="alert" className="mb-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{sendError}</p> : null}
        {attachments.length ? <div className="mb-2 flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-sm text-purple-100"><div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">{attachments.map((item) => <img key={item.url} src={item.url} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />)}</div><span className="whitespace-nowrap">{attachments.length} медиа</span><button type="button" onClick={() => setAttachments([])} aria-label="Удалить вложения"><X className="h-4 w-4" /></button></div> : null}
        {pollDraft ? <div className="mb-2 rounded-xl border border-purple-500/30 bg-purple-500/10 p-3"><div className="mb-2 flex items-center justify-between text-sm font-medium text-purple-100"><span>Новый опрос</span><button type="button" onClick={() => setPollDraft(null)} aria-label="Закрыть опрос"><X className="h-4 w-4" /></button></div><input value={pollDraft.question} onChange={(event) => setPollDraft((draft) => ({ ...draft, question: event.target.value }))} placeholder="Вопрос" className="mb-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none" />{pollDraft.options.map((option, index) => <input key={index} value={option} onChange={(event) => setPollDraft((draft) => ({ ...draft, options: draft.options.map((item, itemIndex) => itemIndex === index ? event.target.value : item) }))} placeholder={`Вариант ${index + 1}`} className="mb-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none" />)}<button type="button" onClick={() => setPollDraft((draft) => ({ ...draft, options: [...draft.options, ""] }))} className="text-xs text-purple-300">+ Добавить вариант</button></div> : null}
        <div className="flex items-center gap-3 bg-neutral-900/80 border border-neutral-800/60 rounded-2xl px-4 py-2 backdrop-blur-xl transition-all focus-within:border-purple-500/40 focus-within:bg-neutral-900">
          <label className="cursor-pointer rounded-xl p-2 text-neutral-400 hover:bg-white/5 hover:text-white" aria-label="Открыть галерею"><Paperclip className="h-5 w-5" /><input type="file" accept="image/*,video/*" multiple className="hidden" onChange={(event) => { const files = Array.from(event.target.files || []).filter((file) => ["image/", "video/"].some((type) => file.type.startsWith(type)) && file.size <= 2 * 1024 * 1024).slice(0, 4); files.forEach((file) => { const reader = new FileReader(); reader.onload = () => setAttachments((current) => [...current, { url: String(reader.result), type: file.type.startsWith("video/") ? "video" : "image" }].slice(0, 4)); reader.readAsDataURL(file); }); event.target.value = ""; }} /></label>
          <button type="button" onClick={() => setPollDraft({ question: "", options: ["", ""] })} className="rounded-xl p-2 text-neutral-400 hover:bg-white/5 hover:text-white" aria-label="Создать опрос"><ClipboardList className="h-5 w-5" /></button>
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            className="flex-1 bg-transparent text-white text-[15px] placeholder-neutral-500 outline-none py-2"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!message.trim() && !attachments.length && !pollDraft}
            className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
              message.trim()
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500"
                : "bg-neutral-800 text-neutral-500"
            }`}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatWindow;
