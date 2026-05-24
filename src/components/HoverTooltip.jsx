import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useUIStore } from '../stores/useUIStore'

const HoverTooltip = () => {
  const tooltip = useUIStore(state => state.tooltip)
  const darkMode = useUIStore(state => state.darkMode)
  const tooltipRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = e => {
      if (tooltip.visible && tooltipRef.current) {
        // Offset from cursor
        const offsetX = 15
        const offsetY = 15

        let x = e.clientX + offsetX
        let y = e.clientY + offsetY

        // Boundary checks to keep tooltip on screen
        const tooltipRect = tooltipRef.current.getBoundingClientRect()
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight

        if (x + tooltipRect.width > windowWidth) {
          x = e.clientX - tooltipRect.width - offsetX
        }
        if (y + tooltipRect.height > windowHeight) {
          y = e.clientY - tooltipRect.height - offsetY
        }

        // Use direct DOM manipulation for performance
        tooltipRef.current.style.transform = `translate(${x}px, ${y}px)`
      }
    }

    if (tooltip.visible) {
      window.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [tooltip.visible])

  if (!tooltip.visible) return null

  return createPortal(
    <div
      ref={tooltipRef}
      className={`fixed top-0 left-0 z-[99999] pointer-events-none px-3 py-2 rounded-lg shadow-xl border backdrop-blur-sm transition-opacity duration-200 ${
        darkMode
          ? 'bg-slate-800/90 border-slate-700 text-white'
          : 'bg-white/90 border-slate-200 text-slate-900'
      }`}
      style={{
        // Initial position off-screen to prevent flash before first mouse move
        transform: 'translate(-9999px, -9999px)',
        willChange: 'transform',
      }}
    >
      <div className="flex flex-col gap-0.5">
        {tooltip.label && <span className="font-bold text-sm">{tooltip.label}</span>}
        {tooltip.content && (
          <span className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {tooltip.content}
          </span>
        )}
      </div>
    </div>,
    document.body
  )
}

export default HoverTooltip
