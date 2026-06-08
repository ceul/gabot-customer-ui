import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { specials as api } from '../api'
import { PageHeader, Card, Field, Input, Textarea, Toggle, Button, Select, Spinner, ErrorMsg } from '../components/ui'
import { Plus, Trash2 } from 'lucide-react'

const DAYS = [
  { value: 0, label: 'Lunes' },
  { value: 1, label: 'Martes' },
  { value: 2, label: 'Miércoles' },
  { value: 3, label: 'Jueves' },
  { value: 4, label: 'Viernes' },
  { value: 5, label: 'Sábado' },
  { value: 6, label: 'Domingo' },
]

const EMPTY = { day_of_week: 0, title: '', description: '', is_active: true }

function SpecialCard({ special, onSave, onDelete }) {
  const [saved, setSaved] = useState(false)
  const { register, handleSubmit, control, formState: { isSubmitting } } = useForm({ defaultValues: special })

  const onSubmit = async (data) => {
    setSaved(false)
    await onSave(special.id, { ...data, day_of_week: Number(data.day_of_week) })
    setSaved(true)
  }

  return (
    <Card className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Field label="Día">
          <Select options={DAYS} {...register('day_of_week')} />
        </Field>
        <div className="col-span-2">
          <Field label="Título">
            <Input {...register('title', { required: true })} placeholder="Martes de Tacos" />
          </Field>
        </div>
      </div>
      <Field label="Descripción">
        <Textarea rows={2} {...register('description')} placeholder="3 tacos por $10.000…" />
      </Field>
      <div className="flex items-center justify-between">
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <Toggle checked={field.value} onChange={field.onChange} label="Activo" />
          )}
        />
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-primary">Guardado</span>}
          <Button variant="danger" onClick={() => onDelete(special.id)}>
            <Trash2 size={14} />
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

function NewSpecialForm({ onAdd, onCancel }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: EMPTY })

  const onSubmit = async (data) => {
    await onAdd({ ...data, day_of_week: Number(data.day_of_week) })
  }

  return (
    <Card className="space-y-3 border-dashed border-outline-variant">
      <div className="grid grid-cols-3 gap-3">
        <Field label="Día">
          <Select options={DAYS} {...register('day_of_week')} />
        </Field>
        <div className="col-span-2">
          <Field label="Título">
            <Input {...register('title', { required: true })} placeholder="Martes de Tacos" autoFocus />
          </Field>
        </div>
      </div>
      <Field label="Descripción">
        <Textarea rows={2} {...register('description')} placeholder="3 tacos por $10.000…" />
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? 'Agregando…' : 'Agregar especial'}
        </Button>
      </div>
    </Card>
  )
}

export default function SpecialsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    api.get()
      .then(setRows)
      .catch(() => setError('No se pudieron cargar los especiales.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (id, data) => {
    const updated = await api.update(id, data)
    setRows(prev => prev.map(r => r.id === id ? updated : r))
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este especial?')) return
    await api.delete(id)
    setRows(prev => prev.filter(r => r.id !== id))
  }

  const handleAdd = async (data) => {
    const created = await api.create(data)
    setRows(prev => [...prev, created])
    setAdding(false)
  }

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Especiales del Día" description="Promociones que el bot mencionará el día correspondiente de la semana." />
      {error && <div className="mb-4"><ErrorMsg message={error} /></div>}

      <div className="space-y-4">
        {rows.map(row => (
          <SpecialCard key={row.id} special={row} onSave={handleSave} onDelete={handleDelete} />
        ))}

        {adding ? (
          <NewSpecialForm onAdd={handleAdd} onCancel={() => setAdding(false)} />
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 py-2"
          >
            <Plus size={16} /> Agregar especial
          </button>
        )}
      </div>
    </div>
  )
}
