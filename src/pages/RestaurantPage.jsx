import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { restaurant as api } from '../api'
import { PageHeader, Card, Field, Input, Toggle, SaveBar, Spinner, ErrorMsg } from '../components/ui'

const DEFAULTS = {
  name: '', address: '', phone: '', email: '', website: '',
  delivery_available: true, delivery_fee: '', free_delivery_threshold: '',
}

export default function RestaurantPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, control, watch, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues: DEFAULTS })
  const deliveryOn = watch('delivery_available')

  useEffect(() => {
    api.get()
      .then(data => reset({ ...DEFAULTS, ...data }))
      .catch(() => setError('No se pudo cargar la configuración del restaurante.'))
      .finally(() => setLoading(false))
  }, [reset])

  const onSubmit = async (data) => {
    setError(null); setSaved(false)
    try {
      const updated = await api.update(data)
      reset({ ...DEFAULTS, ...updated })
      setSaved(true)
    } catch {
      setError('Error al guardar. Verifica que el servidor esté en ejecución.')
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Información del Restaurante" description="Datos básicos mostrados a los clientes y usados en el contexto del bot." />
      {error && <div className="mb-4"><ErrorMsg message={error} /></div>}

      <div className="space-y-4">
        <Card>
          <h3 className="text-sm font-semibold text-on-surface mb-4">General</h3>
          <div className="grid grid-cols-1 gap-4">
            <Field label="Nombre del restaurante">
              <Input {...register('name')} placeholder="Mi Restaurante" />
            </Field>
            <Field label="Dirección">
              <Input {...register('address')} placeholder="Cra 13 # 12-23, Ciudad" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Teléfono">
                <Input {...register('phone')} placeholder="+57 300 000 0000" />
              </Field>
              <Field label="Correo electrónico">
                <Input type="email" {...register('email')} placeholder="contacto@ejemplo.com" />
              </Field>
            </div>
            <Field label="Sitio web">
              <Input {...register('website')} placeholder="www.mirestaurante.com" />
            </Field>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-on-surface mb-4">Domicilio</h3>
          <div className="space-y-4">
            <Controller
              name="delivery_available"
              control={control}
              render={({ field }) => (
                <Toggle checked={field.value} onChange={field.onChange} label="Domicilio disponible" />
              )}
            />
            {deliveryOn && (
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Costo de domicilio ($)"
                  hint={errors.delivery_fee?.message || 'Cobrado por debajo del mínimo para envío gratis'}
                  error={!!errors.delivery_fee}
                >
                  <Input
                    type="number" min="0" step="1"
                    placeholder="3000"
                    className={errors.delivery_fee ? 'border-error focus:ring-error' : ''}
                    {...register('delivery_fee', {
                      validate: v => !deliveryOn || !!v || 'Requerido cuando el domicilio está habilitado',
                    })}
                  />
                </Field>
                <Field
                  label="Domicilio gratis desde ($)"
                  hint={errors.free_delivery_threshold?.message}
                  error={!!errors.free_delivery_threshold}
                >
                  <Input
                    type="number" min="0" step="1"
                    placeholder="30000"
                    className={errors.free_delivery_threshold ? 'border-error focus:ring-error' : ''}
                    {...register('free_delivery_threshold', {
                      validate: v => !deliveryOn || !!v || 'Requerido cuando el domicilio está habilitado',
                    })}
                  />
                </Field>
              </div>
            )}
          </div>
        </Card>
      </div>

      <SaveBar saving={isSubmitting} saved={saved} onSave={handleSubmit(onSubmit)} />
    </div>
  )
}
