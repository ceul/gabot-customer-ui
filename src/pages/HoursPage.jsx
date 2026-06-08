import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { hours as api } from '../api'
import { PageHeader, Card, Toggle, Spinner, ErrorMsg, Button } from '../components/ui'

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function DayRow({ row, onSave }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const { register, handleSubmit, control, watch } = useForm({ defaultValues: row })
  const isClosed = watch('is_closed')

  const onSubmit = async (data) => {
    setSaving(true); setSaved(false); setSaveError(false)
    try {
      await onSave(row.day_of_week, data)
      setSaved(true)
    } catch {
      setSaveError(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 mb-2 last:mb-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="font-space w-24 shrink-0 text-sm font-medium text-on-surface">{DAY_NAMES[row.day_of_week]}</span>
        <Controller
          name="is_closed"
          control={control}
          render={({ field }) => (
            <Toggle
              checked={!field.value}
              onChange={val => field.onChange(!val)}
              label={field.value ? 'Cerrado' : 'Abierto'}
            />
          )}
        />
        {!isClosed && (
          <div className="flex items-center gap-2">
            <input
              type="time"
              {...register('open_time')}
              className="border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-primary text-on-surface text-sm px-2 py-1.5 disabled:opacity-40"
            />
            <span className="text-outline text-sm">a</span>
            <input
              type="time"
              {...register('close_time')}
              className="border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-primary text-on-surface text-sm px-2 py-1.5 disabled:opacity-40"
            />
          </div>
        )}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {saved && <span className="text-primary text-xs font-medium">Guardado</span>}
          {saveError && <span className="text-xs text-red-500">Error al guardar</span>}
          <Button variant="secondary" onClick={handleSubmit(onSubmit)} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function HoursPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get()
      .then(setRows)
      .catch(() => setError('No se pudieron cargar los horarios.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (day, data) => {
    const updated = await api.updateDay(day, data)
    setRows(prev => prev.map(r => r.day_of_week === day ? updated : r))
  }

  if (loading) return <Spinner />

  return (
    <div className="bg-background">
      <PageHeader title="Horarios de Atención" description="Configura los horarios de apertura por día. Cada fila se guarda de forma independiente." />
      {error && <div className="mb-4"><ErrorMsg message={error} /></div>}
      <div className="space-y-0">
        {rows.map(row => (
          <DayRow key={row.day_of_week} row={row} onSave={handleSave} />
        ))}
      </div>
    </div>
  )
}
