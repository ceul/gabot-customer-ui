import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { paymentMethods as api } from '../api'
import { PageHeader, Card, Field, Input, Toggle, Button, Spinner, ErrorMsg } from '../components/ui'
import { Plus, Trash2, QrCode } from 'lucide-react'

const SIMPLE_LABELS = {
  cash:        'Efectivo',
  credit_card: 'Tarjeta de crédito',
  debit_card:  'Tarjeta débito',
}

function SimpleMethodCard({ method, onToggle }) {
  const [saving, setSaving] = useState(false)

  const handleToggle = async (val) => {
    setSaving(true)
    await onToggle(method.id, val)
    setSaving(false)
  }

  return (
    <Card className="flex items-center justify-between bg-surface border border-outline-variant/30 rounded-xl p-4">
      <span className="text-sm font-space font-semibold text-on-surface">
        {SIMPLE_LABELS[method.method_type] ?? method.method_type}
      </span>
      <Toggle
        checked={method.is_enabled}
        onChange={handleToggle}
        disabled={saving}
        label={method.is_enabled ? 'Habilitado' : 'Deshabilitado'}
      />
    </Card>
  )
}

function BankAccountCard({ method, onSave, onDelete }) {
  const [saved, setSaved] = useState(false)
  const [qrPreview, setQrPreview] = useState(method.qr_image || null)
  const fileRef = useRef()
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: {
      bank_name:      method.bank_name || '',
      account_holder: method.account_holder || '',
      account_info:   method.account_info || '',
    },
  })

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUri = ev.target.result
      setQrPreview(dataUri)
      setValue('qr_image', dataUri)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data) => {
    setSaved(false)
    await onSave(method.id, { ...data, qr_image: qrPreview })
    setSaved(true)
  }

  return (
    <Card className="space-y-3 bg-surface border border-outline-variant/30 rounded-xl">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Banco">
          <Input {...register('bank_name', { required: true })} placeholder="Bancolombia" />
        </Field>
        <Field label="Titular de la cuenta">
          <Input {...register('account_holder')} placeholder="Juan García" />
        </Field>
      </div>
      <Field label="No. de cuenta / datos de transferencia">
        <Input {...register('account_info', { required: true })} placeholder="123-456789-00" />
      </Field>

      {/* QR upload */}
      <Field label="Código QR (opcional)">
        <div className="flex items-center gap-3">
          {qrPreview ? (
            <img src={qrPreview} alt="QR" className="w-16 h-16 object-contain border rounded" />
          ) : (
            <div className="w-16 h-16 border-2 border-dashed border-outline-variant rounded-xl hover:border-primary hover:text-primary cursor-pointer flex items-center justify-center text-outline">
              <QrCode size={24} />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <Button variant="secondary" onClick={() => fileRef.current?.click()} type="button">
              {qrPreview ? 'Cambiar imagen' : 'Subir QR'}
            </Button>
            {qrPreview && (
              <button
                type="button"
                onClick={() => { setQrPreview(null); setValue('qr_image', '') }}
                className="text-xs text-on-error-container hover:underline"
              >
                Quitar imagen
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </Field>

      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-2">
          {saved && <span className="text-primary text-xs font-medium">Guardado</span>}
          <Button variant="danger" onClick={() => onDelete(method.id)} type="button">
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

const EMPTY_BANK = { bank_name: '', account_holder: '', account_info: '', qr_image: '' }

function NewBankForm({ onAdd, onCancel }) {
  const [qrPreview, setQrPreview] = useState(null)
  const fileRef = useRef()
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm({ defaultValues: EMPTY_BANK })

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUri = ev.target.result
      setQrPreview(dataUri)
      setValue('qr_image', dataUri)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data) => {
    await onAdd({ ...data, method_type: 'money_transfer', qr_image: qrPreview || '' })
  }

  return (
    <Card className="space-y-3 bg-surface border border-dashed border-outline-variant rounded-xl">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Banco">
          <Input {...register('bank_name', { required: true })} placeholder="Bancolombia" autoFocus />
        </Field>
        <Field label="Titular de la cuenta">
          <Input {...register('account_holder')} placeholder="Juan García" />
        </Field>
      </div>
      <Field label="No. de cuenta / datos de transferencia">
        <Input {...register('account_info', { required: true })} placeholder="123-456789-00" />
      </Field>

      <Field label="Código QR (opcional)">
        <div className="flex items-center gap-3">
          {qrPreview ? (
            <img src={qrPreview} alt="QR" className="w-16 h-16 object-contain border rounded" />
          ) : (
            <div className="w-16 h-16 border-2 border-dashed border-outline-variant rounded-xl hover:border-primary hover:text-primary cursor-pointer flex items-center justify-center text-outline">
              <QrCode size={24} />
            </div>
          )}
          <Button variant="secondary" onClick={() => fileRef.current?.click()} type="button">
            {qrPreview ? 'Cambiar imagen' : 'Subir QR'}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </Field>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} type="button">Cancelar</Button>
        <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? 'Agregando…' : 'Agregar cuenta'}
        </Button>
      </div>
    </Card>
  )
}

export default function PaymentPage() {
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingBank, setAddingBank] = useState(false)

  useEffect(() => {
    api.get()
      .then(setMethods)
      .catch(() => setError('No se pudieron cargar los métodos de pago.'))
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = async (id, is_enabled) => {
    const updated = await api.update(id, { is_enabled })
    setMethods(prev => prev.map(m => m.id === id ? updated : m))
  }

  const handleSaveBank = async (id, data) => {
    const updated = await api.update(id, data)
    setMethods(prev => prev.map(m => m.id === id ? updated : m))
  }

  const handleDeleteBank = async (id) => {
    if (!confirm('¿Eliminar esta cuenta bancaria?')) return
    await api.delete(id)
    setMethods(prev => prev.filter(m => m.id !== id))
  }

  const handleAddBank = async (data) => {
    const created = await api.create(data)
    setMethods(prev => [...prev, created])
    setAddingBank(false)
  }

  if (loading) return <Spinner />

  const simpleMethods = methods.filter(m => ['cash', 'credit_card', 'debit_card'].includes(m.method_type))
  const bankAccounts  = methods.filter(m => m.method_type === 'money_transfer')

  return (
    <div className="bg-background">
      <PageHeader
        title="Métodos de Pago"
        description="Configura qué métodos acepta el restaurante. El bot solo mencionará los métodos habilitados."
      />
      {error && <div className="mb-4"><ErrorMsg message={error} /></div>}

      {/* Simple toggles */}
      <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">Métodos simples</h2>
      <div className="space-y-3 mb-8">
        {simpleMethods.map(m => (
          <SimpleMethodCard key={m.id} method={m} onToggle={handleToggle} />
        ))}
      </div>

      {/* Bank transfers */}
      <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">Transferencia bancaria</h2>
      <div className="space-y-4">
        {bankAccounts.map(m => (
          <BankAccountCard key={m.id} method={m} onSave={handleSaveBank} onDelete={handleDeleteBank} />
        ))}

        {addingBank ? (
          <NewBankForm onAdd={handleAddBank} onCancel={() => setAddingBank(false)} />
        ) : (
          <button
            onClick={() => setAddingBank(true)}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 py-2"
          >
            <Plus size={16} /> Agregar cuenta bancaria
          </button>
        )}
      </div>
    </div>
  )
}
