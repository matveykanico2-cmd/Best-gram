import { useState, useRef, useEffect } from 'react'
import { Image, List, Smile, Calendar, MapPin, Loader2, Paperclip } from 'lucide-react'
import { useStore } from '../store/useStore'
import { cn } from '../lib/utils'
import Avatar from './Avatar'

export default function TweetComposer({ parentId = null, onPostSuccess }) {
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [mediaType, setMediaType] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const addTweet = useStore(state => state.addTweet)
  const { users, activeUserId } = useStore()
  const user = users.find(u => u.id === activeUserId) || users[0]
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  const EMOJIS = ['😀', '😂', '😍', '🤔', '🔥', '✨', '🚀', '💯', '🙏', '😭', '👀', '✅']

  const charLimit = 280
  const charCount = content.length
  const isOverLimit = charCount > charLimit
  const progress = Math.min((charCount / charLimit) * 100, 100)
  const radius = 10
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [content])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (file) {
      if (file.size > 6 * 1024 * 1024) return window.alert('Медиафайл должен быть не больше 6 МБ')
      const nextType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : null
      if (!nextType) return window.alert('Поддерживаются фото, видео и аудио')
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result)
        setMediaType(nextType)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePost = () => {
    if ((content.trim() || image) && !isOverLimit) {
      addTweet(content, parentId, image, mediaType)
      setContent('')
      setImage(null)
      setMediaType(null)
      if (onPostSuccess) onPostSuccess()
    }
  }

  return (
    <div className="flex gap-4 p-4 border-b border-border">
      <Avatar src={user.avatar} name={user.name} className="w-10 h-10 rounded-full shrink-0" />
      
      <div className="flex-1 flex flex-col gap-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? "Напишите ответ" : "Что нового? Поделитесь мыслью..."}
          className="w-full bg-transparent text-xl outline-none resize-none overflow-hidden placeholder:text-secondary min-h-[50px] py-2"
        />

        {image && (
          <div className="relative mt-2 rounded-2xl overflow-hidden border border-border group">
            {mediaType === 'video' && <video src={image} controls className="w-full max-h-[300px] object-contain" />}
            {mediaType === 'audio' && <audio src={image} controls className="w-full p-4" />}
            {(!mediaType || mediaType === 'image') && <img src={image} alt="Upload" className="w-full h-auto max-h-[300px] object-cover" />}
            <button 
              onClick={() => { setImage(null); setMediaType(null) }}
              className="absolute top-2 left-2 p-1.5 bg-black/60 hover:bg-black/40 text-white rounded-full transition-colors"
            >
              <Loader2 size={20} className="hidden" /> {/* Placeholder for logic */}
              <span className="text-xl leading-none">×</span>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-transparent relative">
          <div className="flex items-center gap-1 text-primary">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*,video/*,audio/*" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current.click()}
              type="button"
              title="Добавить фото, GIF, видео или аудио"
              className="flex items-center gap-1 rounded-full p-2 text-xs font-bold hover:bg-primary/10 transition-colors"
            >
              <Paperclip size={18} />
              <span className="hidden sm:inline">GIF</span>
            </button>
            <button type="button" title="Добавить список" onClick={() => setContent(value => `${value}${value ? ' ' : ''}📋`)} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
              <List size={18} />
            </button>
            <div className="relative">
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowEmojiPicker(!showEmojiPicker)
                }}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  showEmojiPicker ? "bg-primary/20 text-primary" : "hover:bg-primary/10"
                )}
              >
                <Smile size={18} />
              </button>
              
              {showEmojiPicker && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowEmojiPicker(false)}
                  />
                  <div className="absolute bottom-full left-0 mb-2 bg-black border border-border rounded-2xl shadow-2xl p-2 grid grid-cols-4 gap-1 z-50 min-w-[160px] animate-in fade-in zoom-in duration-150 origin-bottom-left">
                    {EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          const start = textareaRef.current.selectionStart
                          const end = textareaRef.current.selectionEnd
                          const text = content
                          const before = text.substring(0, start)
                          const after = text.substring(end)
                          const newText = before + emoji + after
                          
                          setContent(newText)
                          setShowEmojiPicker(false)
                          
                          // Focus and set cursor position back
                          setTimeout(() => {
                            textareaRef.current.focus()
                            textareaRef.current.setSelectionRange(start + emoji.length, start + emoji.length)
                          }, 0)
                        }}
                        className="p-2 hover:bg-white/10 rounded-xl text-xl transition-colors flex items-center justify-center"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button type="button" title="Добавить дату" onClick={() => setContent(value => `${value}${value ? ' ' : ''}${new Date().toLocaleDateString('ru-RU')}`)} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
              <Calendar size={18} />
            </button>
            <button type="button" title="Добавить местоположение" onClick={() => { const place = window.prompt('Укажите место'); if (place?.trim()) setContent(value => `${value}${value ? ' ' : ''}📍 ${place.trim()}`) }} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
              <MapPin size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {content.length > 0 && (
              <div className="relative flex items-center justify-center w-8 h-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="16"
                    cy="16"
                    r={radius}
                    stroke={isOverLimit ? '#ef4444' : '#2f3336'}
                    strokeWidth="2"
                    fill="transparent"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r={radius}
                    stroke={isOverLimit ? '#ef4444' : (progress > 90 ? '#eab308' : '#1d9bf0')}
                    strokeWidth="2"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300"
                  />
                </svg>
                {charCount >= charLimit - 20 && (
                  <span className={cn(
                    "absolute text-[10px] font-bold",
                    isOverLimit ? "text-red-500" : "text-secondary"
                  )}>
                    {charLimit - charCount}
                  </span>
                )}
              </div>
            )}
            
            <div className={content.length > 0 ? "w-[1px] h-8 bg-border mx-1" : ""} />

            <button
              onClick={handlePost}
              disabled={!content.trim() || isOverLimit}
              className={cn(
                "bg-primary text-white font-bold px-4 py-1.5 rounded-full transition-all",
                (!content.trim() || isOverLimit) ? "opacity-50 cursor-not-allowed" : "hover:bg-[#1a8cd8]"
              )}
            >
              Опубликовать
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
