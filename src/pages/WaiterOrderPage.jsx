import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronDown, ChevronRight, Minus, Plus } from 'lucide-react'
import WaiterAppBar from '../components/WaiterAppBar'
import TableChip from '../components/TableChip'
import UpsellCard from '../components/UpsellCard'
import { Spinner } from '../components/ui'
import { menu, recommend, orders } from '../api'
import { useAuth } from '../context/AuthContext'

const TABLES = Array.from({ length: 10 }, (_, i) => `Mesa ${i + 1}`)

const COP_FMT = new Intl.NumberFormat('es-CO', { style: 'decimal', minimumFractionDigits: 0 })
const fmt = (n) => `$${COP_FMT.format(Math.round(n))}`

export default function WaiterOrderPage() {
  const { restaurant } = useAuth()
  const restaurantId = restaurant?.id

  const [categories, setCategories] = useState([])
  const [menuLoading, setMenuLoading] = useState(true)
  const [table, setTable] = useState(null)
  const [expanded, setExpanded] = useState({})
  const [quantities, setQuantities] = useState({})

  const [step, setStep] = useState('order') // 'order' | 'loading' | 'upsell' | 'success' | 'error'
  const [upsell, setUpsell] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const abortRef = useRef(null)

  useEffect(() => {
    menu.categories()
      .then(data => {
        const cats = Array.isArray(data) ? data : (data?.categories || [])
        setCategories(cats)
        if (cats.length > 0) setExpanded({ [cats[0].id]: true })
      })
      .catch(() => setCategories([]))
      .finally(() => setMenuLoading(false))
  }, [])

  const orderItems = categories.flatMap(cat =>
    (cat.items || [])
      .filter(item => quantities[item.id] > 0)
      .map(item => ({ ...item, qty: quantities[item.id] }))
  )

  const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0)
  const totalCount = orderItems.reduce((sum, i) => sum + i.qty, 0)

  const setQty = useCallback((itemId, delta) => {
    setQuantities(prev => {
      const next = (prev[itemId] || 0) + delta
      if (next < 0) return prev
      return { ...prev, [itemId]: next }
    })
  }, [])

  const toggleCategory = useCallback((catId) => {
    setExpanded(prev => ({ ...prev, [catId]: !prev[catId] }))
  }, [])

  const handleSiguiente = async () => {
    if (orderItems.length === 0) return
    setStep('loading')

    const controller = new AbortController()
    abortRef.current = controller

    const timeout = setTimeout(() => {
      controller.abort()
      proceedToConfirm(null)
    }, 10000)

    try {
      const data = await recommend.suggest(
        restaurantId,
        {
          order_items: orderItems.map(i => i.name),
          stage: 'pre_confirm',
        },
        controller.signal,
      )
      clearTimeout(timeout)
      const suggestion = data?.suggestions?.[0]
      if (suggestion) {
        setUpsell(suggestion)
        setStep('upsell')
      } else {
        proceedToConfirm(null)
      }
    } catch {
      clearTimeout(timeout)
      proceedToConfirm(null)
    }
  }

  const proceedToConfirm = useCallback(async (upsellSuggestion) => {
    setStep('order')
    const items = [...orderItems]
    if (upsellSuggestion) {
      items.push({
        id: upsellSuggestion.item_id,
        name: upsellSuggestion.item_name,
        price: upsellSuggestion.item_price || 0,
        qty: 1,
      })
    }
    try {
      await orders.create({
        items: items.map(i => ({ name: i.name, price: i.price, quantity: i.qty })),
        table_number: table,
        customer_phone: 'waiter',
      })
      setStep('success')
    } catch {
      setStep('error')
      setErrorMsg('No se pudo enviar el pedido.')
    }
  }, [orderItems, table])

  const handleUpsellAccept = async () => {
    if (upsell?.log_id) {
      try { await recommend.accept(restaurantId, upsell.log_id) } catch { /* ignore */ }
    }
    proceedToConfirm(upsell)
    setUpsell(null)
  }

  const handleUpsellDecline = () => {
    setUpsell(null)
    proceedToConfirm(null)
  }

  const handleNewOrder = () => {
    setQuantities({})
    setTable(null)
    setStep('order')
    setUpsell(null)
    setErrorMsg('')
  }

  const handleClose = () => {
    if (abortRef.current) abortRef.current.abort()
    handleNewOrder()
  }

  if (step === 'success') {
    return (
      <div className="flex min-h-screen flex-col bg-stone-50">
        <WaiterAppBar title="Nuevo pedido" onClose={handleClose} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <span className="text-4xl">✓</span>
          <p className="text-lg font-semibold text-gray-800">
            Pedido enviado{table ? ` — ${table}` : ''}
          </p>
          <button
            type="button"
            onClick={handleNewOrder}
            className="rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-700"
          >
            Nuevo pedido
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      <WaiterAppBar title="Nuevo pedido" onClose={handleClose} />

      {/* Table selector */}
      <div className="relative overflow-x-auto border-b border-gray-200 bg-white">
        <div className="flex gap-2 px-4 py-3">
          <TableChip
            label="Para llevar 🛵"
            variant="takeout"
            selected={table === null}
            onClick={() => setTable(null)}
          />
          {TABLES.map(t => (
            <TableChip
              key={t}
              label={t}
              selected={table === t}
              onClick={() => setTable(t)}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white" />
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto pb-24">
        {menuLoading ? (
          <div className="flex justify-center pt-12"><Spinner /></div>
        ) : categories.length === 0 ? (
          <p className="px-6 pt-12 text-center text-sm text-gray-500">
            El menú no está configurado aún.
          </p>
        ) : (
          categories.map(cat => (
            <div key={cat.id} className="border-b border-gray-100">
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-gray-800"
              >
                <span>{cat.name}</span>
                {expanded[cat.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {expanded[cat.id] && (
                <div className="divide-y divide-gray-50 bg-white">
                  {(cat.items || []).filter(i => i.available !== false).map(item => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{fmt(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {quantities[item.id] > 0 ? (
                          <>
                            <button
                              type="button"
                              aria-label={`Quitar ${item.name}`}
                              onClick={() => setQty(item.id, -1)}
                              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold" aria-live="polite">
                              {quantities[item.id]}
                            </span>
                          </>
                        ) : null}
                        <button
                          type="button"
                          aria-label={`Agregar ${item.name}`}
                          onClick={() => setQty(item.id, 1)}
                          className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-600 text-white hover:bg-amber-700"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom bar */}
      <div className="fixed inset-x-0 bottom-0 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
        {step === 'loading' ? (
          <div className="flex w-full flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Spinner />
              <span className="text-sm text-gray-600">Consultando sugerencia…</span>
            </div>
            <button
              type="button"
              onClick={() => { abortRef.current?.abort(); proceedToConfirm(null) }}
              className="text-xs text-gray-500 underline"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              {totalCount > 0
                ? `${totalCount} ítem${totalCount > 1 ? 's' : ''} · ${fmt(totalAmount)}`
                : 'Sin ítems'}
            </p>
            <button
              type="button"
              disabled={totalCount === 0}
              onClick={handleSiguiente}
              className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-amber-700"
            >
              Siguiente →
            </button>
          </>
        )}
      </div>

      {step === 'error' && (
        <div className="fixed inset-x-0 top-14 flex justify-center px-4">
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 shadow">
            {errorMsg}
            <button
              type="button"
              onClick={handleSiguiente}
              className="ml-3 font-semibold underline"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      <UpsellCard
        open={step === 'upsell' && upsell != null}
        itemName={upsell?.item_name || ''}
        itemPrice={upsell?.item_price || 0}
        discountApplied={upsell?.discount_applied ?? null}
        discountType={upsell?.discount_type ?? null}
        reason={upsell?.reason || ''}
        onAccept={handleUpsellAccept}
        onDecline={handleUpsellDecline}
      />
    </div>
  )
}
