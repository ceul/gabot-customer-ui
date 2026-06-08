import { useEffect, useRef, useState } from 'react'
import { conversations as api, bot as botApi } from '../api'
import { MessageSquare, Send, RefreshCw, Search, ChevronLeft } from 'lucide-react'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffMin = Math.floor((now - d) / 60000)
  const diffH = Math.floor(diffMin / 60)
  const diffD = Math.floor(diffH / 24)
  if (diffMin < 1) return 'ahora'
  if (diffMin < 60) return `${diffMin}m`
  if (diffH < 24) return `${diffH}h`
  if (diffD < 7) return `${diffD}d`
  return d.toLocaleDateString('es-CO')
}

function formatClock(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function senderLabel(from, botName) {
  if (from === 'customer') return null
  if (from === 'owner') return 'Tú'
  return botName
}

// ── Conversation list item ────────────────────────────────────────────────────

function ConvItem({ conv, selected, onClick, botName }) {
  const isCustomer = conv.last_from === 'customer'
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors
        ${selected ? 'bg-secondary-container/30 border-l-2 border-l-primary' : ''}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-on-surface truncate">{conv.phone}</span>
        <span className="text-xs text-outline shrink-0 ml-2">{formatTime(conv.last_timestamp)}</span>
      </div>
      <p className={`text-xs truncate ${isCustomer ? 'text-on-surface font-medium' : 'text-outline'}`}>
        {!isCustomer && <span className="mr-1">{conv.last_from === 'owner' ? 'Tú:' : `${botName}:`}</span>}
        {conv.last_message}
      </p>
    </button>
  )
}

// ── Message bubble ────────────────────────────────────────────────────────────

function Bubble({ msg, botName }) {
  const isOwn = msg.from === 'owner' || msg.from === 'agent'
  const label = senderLabel(msg.from, botName)

  const bg = {
    customer: 'bg-surface-container text-on-surface',
    agent:    'bg-primary text-on-primary',
    owner:    'bg-emerald-600 text-white',
  }[msg.from] ?? 'bg-surface-container text-on-surface'

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className="max-w-[72%]">
        {label && (
          <p className={`text-[11px] mb-1 ${isOwn ? 'text-right' : 'text-left'} text-outline`}>{label}</p>
        )}
        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${bg} ${
          isOwn ? 'rounded-tr-sm' : 'rounded-tl-sm'
        }`}>
          {msg.message}
        </div>
        <p className={`text-[10px] text-outline mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
          {formatClock(msg.timestamp)}
        </p>
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function Empty({ icon: Icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-outline">
      <div className="p-4 bg-surface-container rounded-full"><Icon size={28} /></div>
      <p className="text-sm font-medium text-secondary">{title}</p>
      {sub && <p className="text-xs text-outline">{sub}</p>}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ConversationsPage() {
  const [convList, setConvList]       = useState([])
  const [selected, setSelected]       = useState(null)
  const [messages, setMessages]       = useState([])
  const [draft, setDraft]             = useState('')
  const [sending, setSending]         = useState(false)
  const [search, setSearch]           = useState('')
  const [loadingList, setLoadingList] = useState(true)
  const [loadingChat, setLoadingChat] = useState(false)
  const [botName, setBotName]         = useState('Bot')
  const bottomRef = useRef(null)
  const pollRef   = useRef(null)
  const inputRef  = useRef(null)

  const loadList = () =>
    api.list()
      .then(setConvList)
      .finally(() => setLoadingList(false))

  useEffect(() => {
    loadList()
    botApi.get().then(data => { if (data.bot_name) setBotName(data.bot_name) })
  }, [])

  const loadMessages = (phone) =>
    api.get(phone).then(data => setMessages(data.messages ?? []))

  useEffect(() => {
    if (!selected) return
    setLoadingChat(true)
    loadMessages(selected).finally(() => setLoadingChat(false))
  }, [selected])

  useEffect(() => {
    clearInterval(pollRef.current)
    if (!selected) return
    pollRef.current = setInterval(() => {
      loadMessages(selected)
      loadList()
    }, 3000)
    return () => clearInterval(pollRef.current)
  }, [selected])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectConv = (phone) => {
    setSelected(phone)
    setMessages([])
    setDraft('')
  }

  const send = async () => {
    const text = draft.trim()
    if (!text || !selected || sending) return
    setSending(true)
    setDraft('')
    try {
      await api.send(selected, text)
      await loadMessages(selected)
      await loadList()
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const filtered = convList.filter(c =>
    c.phone.toLowerCase().includes(search.toLowerCase()) ||
    c.last_message.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-full">
      {/* ── Panel izquierdo: lista de conversaciones ── */}
      <div className={`${selected ? 'hidden md:flex' : 'flex'} w-full md:w-72 md:shrink-0 border-r border-outline-variant/30 bg-surface flex-col`}>
        <div className="p-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2 bg-surface-container-low rounded-full px-3 py-2 border border-outline-variant">
            <Search size={14} className="text-outline shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar conversaciones…"
              className="bg-transparent text-sm outline-none flex-1 text-on-surface placeholder:text-outline"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="flex justify-center py-10">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <Empty icon={MessageSquare} title="Sin conversaciones" sub="Los mensajes aparecerán aquí" />
          ) : (
            filtered.map(conv => (
              <ConvItem
                key={conv.phone}
                conv={conv}
                selected={selected === conv.phone}
                onClick={() => selectConv(conv.phone)}
                botName={botName}
              />
            ))
          )}
        </div>

        <div className="p-3 border-t border-outline-variant/20">
          <button
            onClick={loadList}
            className="flex items-center gap-2 text-xs text-secondary hover:text-on-surface"
          >
            <RefreshCw size={13} /> Actualizar
          </button>
        </div>
      </div>

      {/* ── Panel derecho: chat ── */}
      {!selected ? (
        <div className="hidden md:flex flex-1 bg-background">
          <Empty icon={MessageSquare} title="Selecciona una conversación" sub="Elige una del panel izquierdo para comenzar" />
        </div>
      ) : (
        <div className="flex flex-1 flex-col bg-background min-w-0">
          <div className="px-5 py-3.5 bg-surface/90 backdrop-blur-sm border-b border-outline-variant/20 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelected(null)}
                className="md:hidden flex items-center gap-1 text-primary text-sm font-medium shrink-0"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{selected}</p>
                <p className="text-xs text-outline">{messages.length} mensajes</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4">
            {loadingChat ? (
              <div className="flex justify-center py-10">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <Empty icon={MessageSquare} title="Sin mensajes" sub="Esta conversación está vacía" />
            ) : (
              <>
                {messages.map((msg, i) => <Bubble key={i} msg={msg} botName={botName} />)}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          <div className="px-4 py-3 bg-surface border-t border-outline-variant/30 shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
                }}
                placeholder="Escribe un mensaje…"
                className="flex-1 resize-none px-3 py-2.5 text-sm border border-outline-variant rounded-xl
                  text-on-surface placeholder:text-outline
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  max-h-32 overflow-y-auto"
                onInput={e => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
                }}
              />
              <button
                onClick={send}
                disabled={!draft.trim() || sending}
                className="p-2.5 bg-primary text-on-primary rounded-full hover:opacity-90
                  disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                <Send size={17} />
              </button>
            </div>
            <p className="text-[10px] text-outline mt-1.5 ml-1">
              Los mensajes se envían por WhatsApp a través de Twilio
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
