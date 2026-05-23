import { Crown } from 'lucide-react'
import { motion } from 'framer-motion'

const PremiumBadge = ({ onClick, size = 'sm', className = '' }) => {
  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  }

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg hover:shadow-xl transition-all ${sizes[size]} ${className}`}
      title="Premium Feature - Click to upgrade"
    >
      <Crown className={iconSizes[size]} />
      <span>PRO</span>
    </motion.button>
  )
}

export default PremiumBadge
