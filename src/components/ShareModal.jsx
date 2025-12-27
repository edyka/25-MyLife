import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Instagram, Twitter, Facebook, Copy, Check } from 'lucide-react'
import { toPng } from 'html-to-image'
import { modernMoods } from '../utils/constants'
import { useLifeStore } from '../stores/useLifeStore'
import { useMilestoneStore } from '../stores/useMilestoneStore'

// Map Tailwind bg classes to actual hex colors for canvas rendering
const colorMap = {
  'bg-emerald-500': '#10b981',
  'bg-pink-500': '#ec4899',
  'bg-blue-500': '#3b82f6',
  'bg-indigo-500': '#6366f1',
  'bg-teal-500': '#14b8a6',
  'bg-amber-500': '#f59e0b',
  'bg-purple-500': '#a855f7',
  'bg-orange-500': '#f97316',
  'bg-green-400': '#4ade80',
  'bg-blue-400': '#60a5fa',
  'bg-yellow-400': '#facc15',
  'bg-red-400': '#f87171',
  'bg-purple-400': '#c084fc',
  'bg-teal-400': '#2dd4bf',
  'bg-orange-400': '#fb923c',
  'bg-blue-300': '#93c5fd',
  'bg-gray-400': '#9ca3af',
}

const ShareModal = ({ isOpen, onClose, userName = 'My' }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [previewDataUrl, setPreviewDataUrl] = useState(null)
  const posterRef = useRef(null)

  // Get data from stores
  const lifeExpectancy = useLifeStore(state => state.lifeExpectancy)
  const currentWeek = useLifeStore(state => state.currentWeek)
  const birthYear = useLifeStore(state => state.birthYear)
  const milestones = useMilestoneStore(state => state.milestones)
  const customMoods = useMilestoneStore(state => state.customMoods)

  // Get all categories including custom - memoized to prevent re-renders
  const allMoods = useMemo(() => ({ ...modernMoods, ...customMoods }), [customMoods])

  // Find which moods are actually used in the grid
  const usedMoods = useCallback(() => {
    const used = new Set()
    Object.values(milestones || {}).forEach(m => {
      if (m?.category && allMoods[m.category]) {
        used.add(m.category)
      }
    })
    return Array.from(used).map(key => ({
      key,
      ...allMoods[key],
    }))
  }, [milestones, allMoods])

  // Generate poster image
  const generatePoster = useCallback(async () => {
    if (!posterRef.current) return null

    setIsGenerating(true)
    try {
      const dataUrl = await toPng(posterRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: 1080,
        height: 1920,
      })
      setPreviewDataUrl(dataUrl)
      return dataUrl
    } catch (error) {
      console.error('Error generating poster:', error)
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [])

  // Generate preview on open
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        generatePoster()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen, generatePoster])

  // Download handler
  const handleDownload = async () => {
    const dataUrl = previewDataUrl || (await generatePoster())
    if (!dataUrl) return

    const link = document.createElement('a')
    link.download = `viventiva-life-grid-${new Date().toISOString().split('T')[0]}.png`
    link.href = dataUrl
    link.click()
  }

  // Share handlers
  const handleShareTwitter = async () => {
    const text = `My life in weeks - visualized with @viventiva_app 🗓️✨\n\nHow will you spend your remaining weeks?`
    const url = 'https://viventiva.com'
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    )
  }

  const handleShareFacebook = () => {
    const url = 'https://viventiva.com'
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
  }

  const handleShareInstagram = async () => {
    // Download the image first, then show instructions
    await handleDownload()
    alert(
      "Image downloaded! Open Instagram and share it from your camera roll. Don't forget to tag @viventiva!"
    )
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://viventiva.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Render mini grid for poster
  const renderMiniGrid = () => {
    const weeks = lifeExpectancy * 52
    const cols = 52
    const rows = Math.ceil(weeks / cols)
    const cellSize = 12
    const gap = 2

    const cells = []
    for (let i = 0; i < weeks; i++) {
      const milestone = milestones?.[i]
      const isPast = i < currentWeek
      const isCurrent = i === currentWeek

      let bgColor = '#e5e7eb' // gray-200 for future
      if (isPast) {
        bgColor = '#d1d5db' // gray-300 for past
      }
      if (milestone?.category && allMoods[milestone.category]) {
        const moodColor = allMoods[milestone.category].color
        bgColor = colorMap[moodColor] || bgColor
      }
      if (isCurrent) {
        bgColor = '#1f2937' // Current week marker
      }

      const x = (i % cols) * (cellSize + gap)
      const y = Math.floor(i / cols) * (cellSize + gap)

      cells.push(
        <rect key={i} x={x} y={y} width={cellSize} height={cellSize} rx={2} fill={bgColor} />
      )
    }

    return (
      <svg
        width={cols * (cellSize + gap) - gap}
        height={rows * (cellSize + gap) - gap}
        className="mx-auto"
      >
        {cells}
      </svg>
    )
  }

  if (!isOpen) return null

  const displayName = userName || 'My'
  const currentAge = birthYear ? new Date().getFullYear() - birthYear : 0
  const weeksLived = currentWeek || 0
  const weeksRemaining = lifeExpectancy * 52 - weeksLived
  const moodsUsed = usedMoods()

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
          onClick={e => e.stopPropagation()}
        >
          {/* Left: Poster Preview */}
          <div className="flex-1 bg-slate-100 p-4 overflow-auto">
            <div className="text-sm text-slate-500 mb-2 text-center">Preview</div>

            {/* Hidden poster for export */}
            <div className="absolute -left-[9999px]">
              <div
                ref={posterRef}
                style={{
                  width: '1080px',
                  height: '1920px',
                  backgroundColor: '#ffffff',
                  padding: '60px',
                  display: 'flex',
                  flexDirection: 'column',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                  <div
                    style={{
                      fontSize: '48px',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      marginBottom: '8px',
                    }}
                  >
                    {displayName}'s Life in Weeks
                  </div>
                  <div style={{ fontSize: '24px', color: '#6b7280' }}>
                    {currentAge} years old • {weeksRemaining.toLocaleString()} weeks remaining
                  </div>
                </div>

                {/* Grid Container */}
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {renderMiniGrid()}
                </div>

                {/* Legend */}
                {moodsUsed.length > 0 && (
                  <div style={{ marginTop: '40px', marginBottom: '40px' }}>
                    <div
                      style={{
                        fontSize: '18px',
                        color: '#9ca3af',
                        marginBottom: '16px',
                        textAlign: 'center',
                      }}
                    >
                      LEGEND
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '16px',
                      }}
                    >
                      {moodsUsed.map(mood => (
                        <div
                          key={mood.key}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '4px',
                              backgroundColor: colorMap[mood.color] || '#9ca3af',
                            }}
                          />
                          <span style={{ fontSize: '16px', color: '#4b5563' }}>{mood.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Branding */}
                <div
                  style={{
                    textAlign: 'center',
                    paddingTop: '30px',
                    borderTop: '1px solid #e5e7eb',
                  }}
                >
                  <div
                    style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: '#6366f1',
                      marginBottom: '8px',
                    }}
                  >
                    VIVENTIVA
                  </div>
                  <div style={{ fontSize: '18px', color: '#9ca3af' }}>
                    viventiva.com • Make every week count
                  </div>
                </div>
              </div>
            </div>

            {/* Visible Preview (scaled down) */}
            <div
              className="bg-white rounded-2xl shadow-lg overflow-hidden mx-auto"
              style={{ maxWidth: '280px', aspectRatio: '9/16' }}
            >
              {previewDataUrl ? (
                <img src={previewDataUrl} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  {isGenerating ? 'Generating...' : 'Loading preview...'}
                </div>
              )}
            </div>
          </div>

          {/* Right: Share Options */}
          <div className="w-full md:w-80 p-6 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Share Your Life</h2>
                <p className="text-sm text-slate-500">Inspire others with your journey</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mb-4"
            >
              <Download className="w-5 h-5" />
              Download Image
            </button>

            {/* Social Share Buttons */}
            <div className="text-sm text-slate-500 mb-3">Share to social media</div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={handleShareInstagram}
                className="py-3 px-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Instagram className="w-5 h-5" />
                Instagram
              </button>
              <button
                onClick={handleShareTwitter}
                className="py-3 px-4 bg-black text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Twitter className="w-5 h-5" />X / Twitter
              </button>
              <button
                onClick={handleShareFacebook}
                className="py-3 px-4 bg-blue-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Facebook className="w-5 h-5" />
                Facebook
              </button>
              <button
                onClick={handleCopyLink}
                className="py-3 px-4 bg-slate-200 text-slate-700 font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-slate-300 transition-colors"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            {/* Stats Preview */}
            <div className="mt-auto pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Your Stats</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="font-bold text-slate-800">{weeksLived.toLocaleString()}</div>
                  <div className="text-slate-500 text-xs">Weeks Lived</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="font-bold text-slate-800">{weeksRemaining.toLocaleString()}</div>
                  <div className="text-slate-500 text-xs">Weeks Left</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

export default ShareModal
