import { motion, AnimatePresence } from 'framer-motion'
import { Flame } from 'lucide-react'
import { useEngagementStore } from '../stores/useEngagementStore'
import { useUIStore } from '../stores/useUIStore'
import { useEffect, useState } from 'react'

const StreakDisplay = () => {
  const streak = useEngagementStore(state => state.streak)
  const darkMode = useUIStore(state => state.darkMode)
  const [prevStreak, setPrevStreak] = useState(streak)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (streak > prevStreak) {
      setShowCelebration(true)
      const timer = setTimeout(() => setShowCelebration(false), 2000)
      return () => clearTimeout(timer)
    }
    setPrevStreak(streak)
  }, [streak, prevStreak])

  if (streak === 0) return null

  return (
    <div className="relative">
      <motion.div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
          darkMode
            ? 'bg-slate-800 border-slate-700 text-orange-400'
            : 'bg-white border-slate-200 text-orange-500'
        } shadow-sm`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={`${streak} week streak!`}
      >
        <motion.div
          animate={
            showCelebration
              ? {
                  scale: [1, 1.5, 1],
                  rotate: [0, 15, -15, 0],
                  filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'],
                }
              : {}
          }
          transition={{ duration: 0.5 }}
        >
          <Flame
            className={`w-4 h-4 ${showCelebration ? 'fill-orange-500' : 'fill-orange-500/20'}`}
          />
        </motion.div>
        <span className="text-sm font-bold font-mono">{streak}</span>
      </motion.div>

      {/* Celebration Particles */}
      <AnimatePresence>
        {showCelebration && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 1,
                  x: (Math.random() - 0.5) * 40,
                  y: (Math.random() - 0.5) * 40 - 20,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute left-1/2 top-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full"
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default StreakDisplay
