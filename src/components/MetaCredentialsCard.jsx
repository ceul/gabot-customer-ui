import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { metaCredentials as api } from '../api'
import { Card, Field, Input, Button, ErrorMsg } from './ui'

const DEFAULTS = { phone_number_id: '', waba_id: '', meta_access_token: '' }

export default function MetaCredentialsCard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [hasToken, setHasToken] = useState(false)

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: DEFAULTS })

  useEffect(() => {
    api.get()
      .then(data => {
        reset({ phone_number_id: data.phone_number_id || '', waba_id: data.waba_id || '', meta_access_token: '' })
        setHasToken(!!data.has_token)
      })
      .catch(() => setError('No se pudo cargar las credenciales.'))
      .finally(() => setLoading(false))
  }, [reset])

  const onSubmit = async (data) => {
    setError(null); setSaved(false)
    const payload = {
      phone_number_id: data.phone_number_id,
      waba_id: data.waba_id,
    }
    if (data.meta_access_token) {
      payload.meta_access_token = data.meta_access_token
    }
    try {
      const updated = await api.update(payload)
      reset({ phone_number_id: updated.phone_number_id || '', waba_id: updated.waba_id || '', meta_access_token: '' })
      setHasToken(!!updated.has_token)
      setSaved(true)
    } catch {
      setError('Error al guardar las credenciales.')
    }
  }

  const isComplete = hasToken && !loading

  if (loading) return null

  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-semibold text-on-surface">Credenciales de WhatsApp (Meta)</h3>
        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">REQUERIDO</span>
      </div>
      <p className="text-xs text-on-surface-muted mb-4">
        Obtén estos valores en Meta Business Manager → Sistema de usuarios → Token de acceso.
      </p>

      {error && <div className="mb-3"><ErrorMsg message={error} /></div>}

      <div className="space-y-3">
        <Field label="Phone Number ID" hint="ID numérico del número de WhatsApp">
          <Input {...register('phone_number_id')} placeholder="123456789012345" />
        </Field>

        <Field label="WhatsApp Business Account ID (WABA ID)" hint="ID de la cuenta WABA">
          <Input {...register('waba_id')} placeholder="987654321098765" />
        </Field>

        <Field label="Token de acceso" hint="Token del sistema, permanente">
          <Input
            type="password"
            autoComplete="off"
            placeholder="•••••••••••••"
            {...register('meta_access_token')}
          />
          {hasToken && (
            <p className="text-xs text-on-surface-muted mt-1">
              Token guardado. Escribe un nuevo valor para reemplazarlo.
            </p>
          )}
        </Field>
      </div>

      <div className={`mt-4 px-3 py-2 rounded text-xs font-medium flex items-center gap-2 ${
        isComplete
          ? 'bg-green-50 text-green-800 border-l-4 border-green-500'
          : 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400'
      }`}>
        {isComplete ? '✓ Credenciales configuradas — el bot puede enviar y recibir mensajes'
                    : '⚠ Credenciales incompletas — el bot no puede enviar mensajes'}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Guardar credenciales'}
        </Button>
        {saved && <span className="text-xs text-primary font-medium">¡Guardado!</span>}
      </div>
    </Card>
  )
}
