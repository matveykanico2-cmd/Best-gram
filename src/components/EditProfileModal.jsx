import React, { useState } from 'react'
import { X, Camera } from 'lucide-react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { cn } from '../lib/utils'

const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

export default function EditProfileModal({ isOpen, onClose }) {
  const { users, activeUserId, updateProfile } = useStore()
  const user = users.find(u => u.id === activeUserId)
  const avatarInputRef = React.useRef(null)
  const bannerInputRef = React.useRef(null)
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    birthMonth: user?.birthDate ? Number(user.birthDate.slice(5, 7)) : '',
    birthDay: user?.birthDate ? Number(user.birthDate.slice(8, 10)) : '',
    birthYear: user?.birthDate ? Number(user.birthDate.slice(0, 4)) : '',
    avatar: user?.avatar || '',
    banner: user?.banner || '',
    verified: user?.verified || false,
    verifiedType: user?.verifiedType || 'blue'
  })

  if (!isOpen) return null

  const handleImageChange = (e, type) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (file) {
      if (!file.type.startsWith('image/')) return window.alert('Выберите изображение или GIF')
      if (file.size > 6 * 1024 * 1024) return window.alert('Изображение должно быть не больше 6 МБ')
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [type]: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const birthDate = formData.birthYear && formData.birthMonth && formData.birthDay ? `${formData.birthYear}-${String(formData.birthMonth).padStart(2, '0')}-${String(formData.birthDay).padStart(2, '0')}` : ''
    if (await updateProfile({ ...formData, birthDate })) onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#5b7083]/40 backdrop-blur-[1px]"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-black w-full max-w-[600px] max-h-[90vh] rounded-2xl overflow-hidden flex flex-col"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Hidden Inputs */}
          <input 
            type="file" 
            ref={avatarInputRef} 
            className="hidden" 
            accept="image/gif,image/png,image/jpeg,image/webp,image/*"
            onChange={(e) => handleImageChange(e, 'avatar')}
          />
          <input 
            type="file" 
            ref={bannerInputRef} 
            className="hidden" 
            accept="image/gif,image/png,image/jpeg,image/webp,image/*"
            onChange={(e) => handleImageChange(e, 'banner')}
          />

          {/* Header */}
          <div className="flex items-center justify-between px-4 h-14 sticky top-0 bg-black/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-6">
              <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold">Edit profile</h2>
            </div>
            <button 
              type="submit"
              className="bg-white text-black font-bold px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors"
            >
              Save
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Banner Edit */}
            <div className="relative h-48 bg-[#333639]">
              {formData.banner && (
                <img 
                  src={formData.banner} 
                  alt="Banner" 
                  className="w-full h-full object-cover opacity-75"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-4">
                <button 
                  type="button" 
                  onClick={() => bannerInputRef.current?.click()}
                  className="p-3 bg-black/60 rounded-full hover:bg-black/40 transition-colors"
                >
                  <Camera size={22} />
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormData({ ...formData, banner: '' })}
                  className="p-3 bg-black/60 rounded-full hover:bg-black/40 transition-colors"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Avatar Edit */}
            <div className="px-4 -mt-12 relative z-20 mb-8">
              <div className="relative w-28 h-28">
                <img 
                  src={formData.avatar} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full border-4 border-black object-cover opacity-75" 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button 
                    type="button" 
                    onClick={() => avatarInputRef.current?.click()}
                    className="p-3 bg-black/60 rounded-full hover:bg-black/40 transition-colors"
                  >
                    <Camera size={22} />
                  </button>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="px-4 pb-8 space-y-6">
              <div className="group border border-border rounded-md px-3 py-2 focus-within:border-primary transition-colors">
                <label className="block text-secondary text-xs group-focus-within:text-primary transition-colors">Name</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-transparent outline-none text-[17px] pt-1"
                />
              </div>

              <div className="group border border-border rounded-md px-3 py-2 focus-within:border-primary transition-colors">
                <label className="block text-secondary text-xs group-focus-within:text-primary transition-colors">Bio</label>
                <textarea 
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-transparent outline-none text-[17px] pt-1 resize-none"
                />
              </div>

              <div className="group border border-border rounded-md px-3 py-2 focus-within:border-primary transition-colors">
                <label className="block text-secondary text-xs group-focus-within:text-primary transition-colors">Location</label>
                <input 
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-transparent outline-none text-[17px] pt-1"
                />
              </div>

              <div className="group border border-border rounded-md px-3 py-2 focus-within:border-primary transition-colors">
                <label className="block text-secondary text-xs group-focus-within:text-primary transition-colors">Website</label>
                <input 
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full bg-transparent outline-none text-[17px] pt-1"
                />
              </div>

              <div className="group border border-border rounded-md px-3 py-2 focus-within:border-primary transition-colors">
                <label className="block text-secondary text-xs group-focus-within:text-primary transition-colors">Дата рождения</label>
                <div className="grid grid-cols-3 gap-2 pt-2"><select value={formData.birthMonth} onChange={(e) => setFormData({ ...formData, birthMonth: e.target.value })} className="w-full bg-transparent outline-none text-[17px]"><option value="">Месяц</option>{months.map((month, index) => <option value={index + 1} key={month}>{month}</option>)}</select><select value={formData.birthDay} onChange={(e) => setFormData({ ...formData, birthDay: e.target.value })} className="w-full bg-transparent outline-none text-[17px]"><option value="">День</option>{Array.from({ length: 31 }, (_, index) => <option value={index + 1} key={index + 1}>{index + 1}</option>)}</select><select value={formData.birthYear} onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })} className="w-full bg-transparent outline-none text-[17px]"><option value="">Год</option>{Array.from({ length: 108 }, (_, index) => { const year = new Date().getFullYear() - 13 - index; return <option value={year} key={year}>{year}</option> })}</select></div>
              </div>

              <div className="flex items-center justify-between p-1">
                <div className="flex flex-col">
                  <span className="text-[17px] font-bold">Verified Account</span>
                  <p className="text-secondary text-sm">Show a blue checkmark next to your name.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, verified: !formData.verified })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    formData.verified ? "bg-primary" : "bg-[#2f3336]"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    formData.verified ? "left-7" : "left-1"
                  )} />
                </button>
              </div>

              {formData.verified && (
                <div className="flex gap-4 p-1">
                  {['blue', 'gold', 'silver'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, verifiedType: type })}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-xl border border-border text-sm font-bold capitalize transition-all",
                        formData.verifiedType === type ? "bg-white/10 border-primary text-primary" : "hover:bg-white/5"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Scroll Indicator Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black to-transparent pointer-events-none z-20" />
        </form>
      </motion.div>
    </div>
  )
}
