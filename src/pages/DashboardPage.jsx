import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, ShoppingBag, MessageSquare, Truck, Clock, Star, PackageOpen, Plus } from 'lucide-react'
import { dashboard as api } from '../api'
import { PageHeader, Card } from '../components/ui'

const RANGES = [
  { key: 'today', label: 'Hoy' },
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
]

const MIX_COLORS = { delivery: 'bg-primary', pickup: 'bg-tertiary', dine_in: 'bg-secondary', unclassified: 'bg-outline-variant' }

function formatCurrency(value) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
}

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return '—'
  const minutes = Math.round(seconds / 60)
  return `${minutes} min`
}

function SecondaryTile({ icon: Icon, label, sampleSize, children }) {
  const lowConfidence = sampleSize !== undefined && sampleSize > 0 && sampleSize < 5
  const noData = sampleSize === 0
  return (
    <Card className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-secondary">
        <Icon size={16} />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      {children}
      {sampleSize !== undefined && (
        <span className={`text-xs ${lowConfidence || noData ? 'text-amber-600' : 'text-outline'}`}>
          n={sampleSize}{noData ? ' · sin datos' : lowConfidence ? ' · pocos datos' : ''}
        </span>
      )}
    </Card>
  )
}

function DeliveryMixBar({ mix }) {
  const total = mix.delivery + mix.pickup + mix.dine_in + mix.unclassified
  if (total === 0) return <span className="text-lg font-semibold text-on-surface">—</span>
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-container-low">
      {Object.entries(mix).map(([key, count]) => (
        count > 0 && (
          <div key={key} className={MIX_COLORS[key]} style={{ width: `${(count / total) * 100}%` }} />
        )
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [range, setRange] = useState('today')
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback((r) => {
    setLoading(true)
    api.summary(r).then((data) => {
      setSummary(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => { load(range) }, [range, load])

  if (loading && !summary) {
    return (
      <div>
        <PageHeader title="Panel" description="Métricas de tu canal de WhatsApp" />
      </div>
    )
  }

  const isEmpty = summary && summary.order_count === 0

  return (
    <div>
      <PageHeader title="Panel" description="Métricas de tu canal de WhatsApp" />

      <div className="flex gap-2 mb-6">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              range === r.key
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-secondary hover:text-on-surface'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {isEmpty ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <PackageOpen size={32} className="text-outline" />
          <p className="text-sm font-medium text-on-surface">No hay pedidos todavía en este período</p>
          <p className="text-xs text-secondary">Tus métricas aparecerán aquí en cuanto comiences a recibir pedidos.</p>
          <button
            onClick={() => navigate('/waiter')}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary text-sm font-medium"
          >
            <Plus size={16} /> Crear primer pedido
          </button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-secondary">
                <TrendingUp size={16} />
                <span className="text-xs font-medium uppercase tracking-wide">Ingresos</span>
              </div>
              <span className="text-2xl font-bold text-on-surface">{formatCurrency(summary.revenue_total)}</span>
            </Card>
            <Card className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-secondary">
                <ShoppingBag size={16} />
                <span className="text-xs font-medium uppercase tracking-wide">Pedidos</span>
              </div>
              <span className="text-2xl font-bold text-on-surface">{summary.order_count}</span>
            </Card>
          </div>

          <Card className="mb-6">
            <h3 className="font-space text-sm font-semibold text-on-surface mb-3">Lo más vendido</h3>
            <ul className="space-y-2">
              {summary.top_items.map((item, i) => (
                <li key={item.name} className="flex items-center gap-3 text-sm">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-container text-on-primary-container text-xs font-semibold shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-on-surface">{item.name}</span>
                  <span className="text-secondary">{item.quantity} · {formatCurrency(item.revenue)}</span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <SecondaryTile icon={MessageSquare} label="Conversaciones">
              <span className="text-lg font-semibold text-on-surface">{summary.conversation_count}</span>
            </SecondaryTile>
            <SecondaryTile icon={Truck} label="Mezcla de entrega">
              <DeliveryMixBar mix={summary.delivery_mix} />
            </SecondaryTile>
            <SecondaryTile icon={Clock} label="Tiempo de entrega" sampleSize={summary.fulfillment_sample_size}>
              <span className="text-lg font-semibold text-on-surface">{formatDuration(summary.avg_fulfillment_seconds)}</span>
            </SecondaryTile>
            <SecondaryTile icon={Star} label="Calificación" sampleSize={summary.rating_sample_size}>
              <span className="text-lg font-semibold text-on-surface">
                {summary.avg_rating !== null ? summary.avg_rating.toFixed(1) : '—'}
              </span>
            </SecondaryTile>
          </div>
        </>
      )}
    </div>
  )
}
