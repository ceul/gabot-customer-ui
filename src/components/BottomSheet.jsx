import { useEffect, useRef } from 'react'

export default function BottomSheet({ open, onClose, children, 'aria-labelledby': labelledBy }) {
  const sheetRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const firstFocusable = sheetRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    firstFocusable?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const focusable = sheetRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault()
          ;(e.shiftKey ? last : first).focus()
        }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        data-testid="bottom-sheet-backdrop"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="relative z-10 rounded-t-2xl bg-white shadow-2xl"
      >
        <div className="flex justify-center pt-3 pb-1">
          <div
            data-testid="drag-handle"
            className="h-1 w-12 rounded-full bg-gray-300"
          />
        </div>
        {children}
      </div>
    </div>
  )
}
