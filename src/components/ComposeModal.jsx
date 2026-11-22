import { X } from 'lucide-react'
import { useStore } from '../store/useStore'
import TweetComposer from './TweetComposer'
import { motion, AnimatePresence } from 'framer-motion'

export default function ComposeModal() {
  const { isComposeModalOpen, setIsComposeModalOpen } = useStore()

  if (!isComposeModalOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsComposeModalOpen(false)}
          className="absolute inset-0 bg-[#5b708366]"
        />
        
        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="bg-black w-full max-w-[600px] rounded-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center px-4 h-14">
            <button 
              onClick={() => setIsComposeModalOpen(false)}
              className="p-2 hover:bg-hover rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Composer Body */}
          <div className="px-4 pb-4 overflow-y-auto">
            <TweetComposer onPostSuccess={() => setIsComposeModalOpen(false)} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
