import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export default function TestDialog({ open, onClose, onSend }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: 'smooth' })
  }, [messages, sending])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setError(null)
    setSending(true)
    const history = messages.map(m => ({ role: m.role, content: m.content }))
    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    try {
      const reply = await onSend(text, history)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setError('Error al conectar con el bot. Intenta de nuevo.')
      setMessages(prev => prev.filter((_, i) => i < prev.length))
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="testdialog-title"
        className="w-full max-w-lg bg-white rounded-2xl flex flex-col overflow-hidden shadow-xl"
        style={{ maxHeight: '90vh', maxWidth: 'fit-content' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 id="testdialog-title" className="text-sm font-semibold text-gray-900">
              Probar Bot
            </h2>
            <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold uppercase rounded-full px-2 py-0.5">
              Modo Prueba
            </span>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                type="button"
                aria-label="Limpiar"
                onClick={() => { setMessages([]); setError(null) }}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              >
                Limpiar
              </button>
            )}
            <button
              type="button"
              aria-label="Cerrar"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC] min-h-[350px]">
          {messages.length === 0 && !sending && (
            <p className="text-center text-sm text-gray-400 mt-8">
              Escribe un mensaje para probar al bot
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`
                  max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed
                  ${m.role === 'user'
                    ? 'bg-[#2563EB] text-white rounded-br-sm'
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm shadow-sm'
                  }
                `}
              >
                {m.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          {error && (
            <p className="text-center text-xs text-red-500">{error}</p>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t border-gray-100 flex gap-2 items-end bg-white">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje…"
            disabled={sending}
            className="
              flex-1 rounded-full border border-gray-200 px-4 py-2
              text-sm text-gray-900
              focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
              disabled:bg-gray-50 disabled:text-gray-400
            "
          />
          <button
            type="button"
            aria-label="Enviar"
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="
              w-11 h-11 flex items-center justify-center
              bg-[#2563EB] text-white rounded-full
              hover:bg-blue-700 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              flex-shrink-0
            "
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
