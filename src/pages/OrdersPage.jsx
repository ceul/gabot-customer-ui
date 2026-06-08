import { useEffect, useState, useCallback } from 'react'
import { LayoutGrid, List, X, ChevronRight, RefreshCw, Package, Clock } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { orders as api } from '../api'
import { Spinner, ErrorMsg, Button } from '../components/ui'
import socket from '../socket'
import { useAuth } from '../context/AuthContext'

/* ─── Design tokens ─────────────────────────────────────────────────────── */

const STATUS_CONFIG = {
  on_hold:    { label: 'En Espera',  short: 'Espera',    dot: '#D97706', ring: '#FDE68A', bg: '#FFFBEB', text: '#92400E', bar: '#F59E0B' },
  in_process: { label: 'En Proceso', short: 'Proceso',   dot: '#2563EB', ring: '#BFDBFE', bg: '#EFF6FF', text: '#1E40AF', bar: '#3B82F6' },
  done:       { label: 'Listo',      short: 'Listo',     dot: '#16A34A', ring: '#BBF7D0', bg: '#F0FDF4', text: '#14532D', bar: '#22C55E' },
  delivered:  { label: 'Entregado',  short: 'Entregado', dot: '#64748B', ring: '#E2E8F0', bg: '#F8FAFC', text: '#334155', bar: '#94A3B8' },
}

const STATUSES = ['on_hold', 'in_process', 'done', 'delivered']

/* ─── Utilities ─────────────────────────────────────────────────────────── */

function timeAgo(isoString) {
  if (!isoString) return ''
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

function itemsSummary(items = []) {
  if (!items.length) return '—'
  const extra = items.length - 1
  return extra === 0 ? items[0].name : `${items[0].name} +${extra} más`
}

function fmt(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })
}

/* ─── Order Card (Kanban) ────────────────────────────────────────────────── */

function OrderCard({ order, onClick }) {
  const cfg = STATUS_CONFIG[order.status]
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: order.id })

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onClick(order.id)}
      className="w-full text-left bg-surface rounded-2xl p-4 shadow-sm border border-outline-variant/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
      style={{
        opacity: isDragging ? 0.35 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      <div className="w-full h-0.5 rounded-full mb-3" style={{ background: cfg.bar }} />

      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-outline font-mono" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
          {order.order_ref}
        </span>
        <span className="flex items-center gap-1 text-outline" style={{ fontSize: '0.68rem' }}>
          <Clock size={10} />
          {timeAgo(order.updated_at)}
        </span>
      </div>

      <p className="text-sm font-semibold text-on-surface mb-1 truncate">{order.customer_phone}</p>
      <p className="text-xs text-secondary truncate mb-3">{itemsSummary(order.items)}</p>

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-on-surface">${Number(order.total).toFixed(2)}</span>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.text }}>
          {cfg.short}
        </span>
      </div>
    </button>
  )
}

/* ─── Kanban Column ──────────────────────────────────────────────────────── */

function KanbanColumn({ statusKey, orders, onCardClick }) {
  const cfg = STATUS_CONFIG[statusKey]
  const { setNodeRef, isOver } = useDroppable({ id: statusKey })

  return (
    <div
      className="flex flex-col shrink-0 rounded-xl overflow-hidden"
      style={{
        width: 272,
        border: `1.5px solid ${isOver ? cfg.dot : cfg.ring}`,
        transition: 'border-color 120ms',
      }}
    >
      {/* column header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ background: cfg.bg, borderBottom: `1.5px solid ${cfg.ring}` }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
          <span className="font-space font-semibold text-secondary uppercase text-xs tracking-wide">
            {cfg.label}
          </span>
        </div>
        <span className="text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full text-white" style={{ background: cfg.dot }}>
          {orders.length}
        </span>
      </div>

      {/* droppable body */}
      <div
        ref={setNodeRef}
        className="flex-1 p-3 space-y-3 overflow-y-auto bg-surface-container-low/50"
        style={{
          minHeight: 160,
          transition: 'background 120ms',
          ...(isOver ? { background: cfg.bg } : {}),
        }}
      >
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Package size={20} className="text-outline" />
            <p className="text-xs text-outline">Sin pedidos</p>
          </div>
        ) : (
          orders.map((o, i) => (
            <div key={o.id} className="card-anim" style={{ animationDelay: `${i * 60}ms` }}>
              <OrderCard order={o} onClick={onCardClick} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/* ─── Table View ─────────────────────────────────────────────────────────── */

const TABLE_COLS = [
  { label: 'Pedido',       key: 'order_ref' },
  { label: 'Cliente',      key: 'customer_phone' },
  { label: 'Items',        key: null,          cls: 'hidden md:table-cell' },
  { label: 'Total',        key: 'total',       align: 'right' },
  { label: 'Estado',       key: 'status' },
  { label: 'Creado',       key: 'created_at',  cls: 'hidden lg:table-cell' },
  { label: 'Actualizado',  key: 'updated_at',  cls: 'hidden lg:table-cell' },
  { label: '',             key: null },
]

function OrderTable({ orders, onStatusChange, onRowClick }) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = (key) => {
    if (!key) return
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = sortKey ? [...orders].sort((a, b) => {
    let av = a[sortKey] ?? '', bv = b[sortKey] ?? ''
    if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase() }
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  }) : orders

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30"
    >
      <div className="overflow-x-auto">
      <table className="w-full text-sm bg-surface">
        <thead>
          <tr className="bg-surface-container border-b border-outline-variant/30">
            {TABLE_COLS.map((col, i) => (
              <th
                key={i}
                onClick={() => handleSort(col.key)}
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-secondary ${col.cls ?? ''} ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.key ? 'cursor-pointer select-none hover:text-on-surface' : ''}`}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.key && sortKey === col.key && (
                    <span style={{ color: '#D97706' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td colSpan={TABLE_COLS.length} className="text-center py-16">
                <Package size={28} className="mx-auto text-outline mb-2" />
                <p className="text-sm text-secondary">Sin pedidos</p>
              </td>
            </tr>
          )}
          {sorted.map(o => {
            const cfg = STATUS_CONFIG[o.status]
            return (
              <tr
                key={o.id}
                className="border-b border-outline-variant/30 last:border-0 hover:bg-surface-container-low transition-colors duration-100 cursor-pointer"
                onClick={() => onRowClick(o.id)}
              >
                <td className="px-4 py-3.5">
                  <span className="font-mono text-outline" style={{ fontSize: '0.68rem', background: cfg.bg, color: cfg.text, padding: '2px 6px', borderRadius: 4, letterSpacing: '0.04em' }}>
                    {o.order_ref}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-medium text-on-surface">{o.customer_phone}</td>
                <td className="px-4 py-3.5 text-secondary max-w-[160px] truncate hidden md:table-cell">{itemsSummary(o.items)}</td>
                <td className="px-4 py-3.5 text-right font-semibold text-on-surface">${Number(o.total).toFixed(2)}</td>
                <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                  <select
                    value={o.status}
                    onChange={e => onStatusChange(o.id, e.target.value)}
                    className="text-xs font-medium border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.ring }}
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3.5 text-xs text-secondary hidden lg:table-cell">{fmt(o.created_at)}</td>
                <td className="px-4 py-3.5 text-xs text-secondary hidden lg:table-cell">{fmt(o.updated_at)}</td>
                <td className="px-4 py-3.5">
                  <ChevronRight size={16} className="text-outline" />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
    </div>
  )
}

/* ─── Detail Modal ───────────────────────────────────────────────────────── */

function OrderModal({ orderId, onClose, onStatusChange }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [updating, setUpdating] = useState(null)
  const [updateError, setUpdateError] = useState(null)

  useEffect(() => {
    api.get(orderId)
      .then(setOrder)
      .catch(() => setFetchError('No se pudo cargar el pedido.'))
      .finally(() => setLoading(false))
  }, [orderId])

  const handleStatus = async (newStatus) => {
    setUpdating(newStatus)
    setUpdateError(null)
    try {
      const updated = await api.updateStatus(orderId, newStatus)
      setOrder(updated)
      onStatusChange(updated)
    } catch {
      setUpdateError('Error al actualizar el estado.')
    } finally {
      setUpdating(null)
    }
  }

  const currentIdx = order ? STATUSES.indexOf(order.status) : -1
  const cfg = order ? STATUS_CONFIG[order.status] : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-on-surface/20 backdrop-blur-sm"
      style={{ animation: 'fadeIn 180ms ease both' }}
      onClick={onClose}
    >
      <div
        className="relative bg-surface w-full sm:max-w-lg sm:mx-4 rounded-t-3xl sm:rounded-3xl shadow-xl border border-outline-variant/20 overflow-hidden flex flex-col"
        style={{ maxHeight: '92vh', animation: 'slideUp 260ms cubic-bezier(0.34,1.56,0.64,1) both' }}
        onClick={e => e.stopPropagation()}
      >
        {cfg && <div className="h-1.5 w-full shrink-0" style={{ background: cfg.bar }} />}

        {/* header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-outline-variant/30 shrink-0">
          <div>
            {order && (
              <span className="font-mono text-outline" style={{ fontSize: '0.68rem', background: cfg?.bg, color: cfg?.text, padding: '2px 8px', borderRadius: 5, letterSpacing: '0.05em' }}>
                {order.order_ref}
              </span>
            )}
            <h2 className="font-cormorant text-on-surface" style={{ fontSize: '1.35rem', fontWeight: 600, marginTop: 4 }}>
              {loading ? 'Cargando…' : order?.customer_phone}
            </h2>
          </div>
          <Button variant="secondary" onClick={onClose} className="!px-0 !py-0 w-8 h-8 justify-center rounded-full mt-1">
            <X size={18} />
          </Button>
        </div>

        {/* body */}
        <div className="overflow-y-auto flex-1">
          {loading && <div className="py-12 flex justify-center"><Spinner /></div>}
          {fetchError && <div className="m-4"><ErrorMsg message={fetchError} /></div>}

          {!loading && order && (
            <div className="px-6 py-5 space-y-6">
              {/* status + total */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-full" style={{ background: cfg.bg, color: cfg.text }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
                  {cfg.label}
                </span>
                <span className="text-xl font-bold text-on-surface">${Number(order.total).toFixed(2)}</span>
              </div>

              {/* items */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-secondary mb-3">Items del pedido</h3>
                <div className="space-y-0">
                  {(order.items || []).map((item, i) => (
                    <div key={item.id ?? i} className="flex items-start justify-between gap-3 py-2.5 border-b border-outline-variant/20 last:border-0">
                      <div className="flex gap-3 items-baseline">
                        <span className="text-xs font-bold text-secondary w-5 shrink-0 text-right">{item.quantity}×</span>
                        <div>
                          <span className="text-sm font-medium text-on-surface">{item.name}</span>
                          {item.notes && <p className="text-xs text-secondary mt-0.5 italic">{item.notes}</p>}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-on-surface shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* special instructions */}
              {order.special_instructions && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Instrucciones</h3>
                  <p className="text-sm text-secondary italic bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3">
                    "{order.special_instructions}"
                  </p>
                </div>
              )}

              {/* history */}
              {(order.history || []).length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-secondary mb-3">Historial</h3>
                  <ol className="relative pl-5 space-y-3">
                    <div className="absolute left-2 top-1 bottom-1 w-px bg-outline-variant/40" />
                    {order.history.map((h, i) => {
                      const toCfg = STATUS_CONFIG[h.to_status]
                      return (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-1 ring-2 ring-surface relative z-10" style={{ background: toCfg.dot }} />
                          <div>
                            <p className="text-xs font-semibold text-on-surface">
                              {h.from_status
                                ? `${STATUS_CONFIG[h.from_status].label} → ${toCfg.label}`
                                : `Pedido creado · ${toCfg.label}`}
                            </p>
                            <p className="text-xs text-secondary mt-0.5">{fmt(h.changed_at)}</p>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        {/* action footer */}
        {updateError && (
          <div className="px-6 pb-1"><ErrorMsg message={updateError} /></div>
        )}
        {!loading && order && (
          <div className="px-6 py-4 border-t border-outline-variant/30 bg-surface-container-low flex flex-wrap gap-2 shrink-0">
            {STATUSES.filter(s => s !== order.status).map((s) => {
              const toCfg = STATUS_CONFIG[s]
              const isPrev = STATUSES.indexOf(s) < currentIdx
              return (
                <button
                  key={s}
                  disabled={updating !== null}
                  onClick={() => handleStatus(s)}
                  className="flex-1 min-w-[100px] text-xs font-semibold py-2.5 rounded-xl transition-all duration-150 disabled:opacity-40"
                  style={{
                    background: updating === s ? toCfg.dot : toCfg.bg,
                    color: updating === s ? '#fff' : toCfg.text,
                    border: `1.5px solid ${toCfg.ring}`,
                  }}
                >
                  {updating === s ? '…' : `${isPrev ? '← ' : ''}${toCfg.short}${!isPrev ? ' →' : ''}`}
                </button>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */

export default function OrdersPage() {
  const { restaurant } = useAuth()
  const [orderList, setOrderList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('kanban')
  const [modalOrderId, setModalOrderId] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const activeOrder = orderList.find(o => o.id === activeId) ?? null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const data = await api.list()
      setOrderList(Array.isArray(data) ? data : [])
    } catch {
      setError('No se pudieron cargar los pedidos.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const restaurantId = restaurant?.id
    socket.connect()
    socket.emit('join_restaurant', { client_id: restaurantId })

    socket.on('order_created', (order) => {
      setOrderList(prev => [order, ...prev])
    })

    socket.on('order_updated', (order) => {
      setOrderList(prev => prev.map(o => o.id === order.id ? order : o))
    })

    // Re-join room after reconnect (socket.io reconnects automatically)
    socket.io.on('reconnect', () => {
      socket.emit('join_restaurant', { client_id: restaurantId })
    })

    return () => {
      socket.off('order_created')
      socket.off('order_updated')
      socket.io.off('reconnect')
      socket.disconnect()
    }
  }, [])

  const handleStatusChange = (updatedOrder) => {
    setOrderList(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o))
  }

  const handleTableStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateStatus(orderId, newStatus)
      // socket emits order_updated → state updated via socket handler for all clients
    } catch {
      setError('Error al actualizar el estado.')
    }
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over) return
    const order = orderList.find(o => o.id === active.id)
    const newStatus = over.id
    if (!order || order.status === newStatus) return

    const prevStatus = order.status
    // Optimistic update — socket event from server confirms for other clients
    setOrderList(prev => prev.map(o => o.id === active.id ? { ...o, status: newStatus } : o))

    api.updateStatus(active.id, newStatus).catch(() => {
      // Revert if API call fails
      setOrderList(prev => prev.map(o => o.id === active.id ? { ...o, status: prevStatus } : o))
      setError('Error al mover el pedido.')
    })
  }

  const grouped = Object.fromEntries(STATUSES.map(s => [s, orderList.filter(o => o.status === s)]))

  return (
    <div className="flex flex-col h-full bg-background">
      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) scale(0.97) } to { opacity:1; transform:none } }
        @keyframes cardIn  { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:none } }
        .card-anim { animation: cardIn 300ms cubic-bezier(0.34,1.56,0.64,1) both; }
        ::-webkit-scrollbar { width:5px; height:5px }
        ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:#D6D3CC; border-radius:99px }
        ::-webkit-scrollbar-thumb:hover { background:#A8A29E }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 shrink-0 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="flex items-center gap-5">
          <div>
            <h2 className="font-cormorant text-on-surface" style={{ fontSize: '1.65rem', fontWeight: 500, lineHeight: 1 }}>
              Pedidos
            </h2>
            <p className="text-xs text-secondary mt-1">
              {loading ? 'Cargando…' : `${orderList.length} pedido${orderList.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {!loading && (
            <div className="hidden sm:flex items-center gap-2">
              {STATUSES.map(s => {
                const count = grouped[s].length
                if (!count) return null
                const cfg = STATUS_CONFIG[s]
                return (
                  <span key={s} className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-surface-container" style={{ color: cfg.bar }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.bar }} />
                    {count} {cfg.short.toLowerCase()}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-lg p-2 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>

          <div className="flex items-center rounded-lg p-0.5 gap-0.5 bg-surface-container">
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${view === 'kanban' ? 'bg-primary text-on-primary' : 'bg-surface-container text-secondary hover:bg-surface-container-high'}`}
            >
              <LayoutGrid size={13} />
              <span className="hidden sm:inline">Tablero</span>
            </button>
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${view === 'table' ? 'bg-primary text-on-primary' : 'bg-surface-container text-secondary hover:bg-surface-container-high'}`}
            >
              <List size={13} />
              <span className="hidden sm:inline">Lista</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {error && (
        <div className="mx-6 mt-4">
          <ErrorMsg message={error} />
        </div>
      )}

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-6">
        {loading && (
          <div className="flex items-center justify-center h-48"><Spinner /></div>
        )}

        {!loading && view === 'kanban' && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={({ active }) => setActiveId(active.id)}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <div className="flex gap-4" style={{ minWidth: 'max-content', paddingBottom: 8, height: '100%' }}>
              {STATUSES.map(s => (
                <KanbanColumn
                  key={s}
                  statusKey={s}
                  orders={grouped[s]}
                  onCardClick={setModalOrderId}
                />
              ))}
            </div>
            <DragOverlay>
              {activeOrder && (
                <div style={{ width: 272, transform: 'rotate(2deg)', pointerEvents: 'none' }}>
                  <OrderCard order={activeOrder} onClick={() => {}} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}

        {!loading && view === 'table' && (
          <OrderTable
            orders={orderList}
            onStatusChange={handleTableStatusChange}
            onRowClick={setModalOrderId}
          />
        )}
      </div>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {modalOrderId && (
        <OrderModal
          orderId={modalOrderId}
          onClose={() => setModalOrderId(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
