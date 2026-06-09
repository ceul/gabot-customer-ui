import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { bot as api } from '../api'
import { PageHeader, Card, Field, Input, Textarea, Select, Toggle, SaveBar, Spinner, ErrorMsg } from '../components/ui'
import MetaCredentialsCard from '../components/MetaCredentialsCard'

const TONES = [
  { value: 'friendly', label: 'Amigable' },
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
  { value: 'professional', label: 'Profesional' },
  { value: 'enthusiastic', label: 'Entusiasta' },
]

const LANGUAGES = [
  { value: 'en', label: 'Inglés' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Francés' },
  { value: 'pt', label: 'Portugués' },
]

const DEFAULTS = { bot_name: '', tone: 'friendly', personality: '', greeting: '', language: 'en', notify_on_status_change: false }

export default function BotPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: DEFAULTS })
  const [notifyEnabled, setNotifyEnabled] = useState(false)

  useEffect(() => {
    api.get()
      .then(data => {
        reset({ ...DEFAULTS, ...data })
        setNotifyEnabled(!!data.notify_on_status_change)
      })
      .catch(() => setError('No se pudo cargar la configuración del bot.'))
      .finally(() => setLoading(false))
  }, [reset])

  const onSubmit = async (data) => {
    setError(null); setSaved(false)
    try {
      const updated = await api.update({ ...data, notify_on_status_change: notifyEnabled })
      reset({ ...DEFAULTS, ...updated })
      setNotifyEnabled(!!updated.notify_on_status_change)
      setSaved(true)
    } catch {
      setError('Error al guardar. Verifica que el servidor esté en ejecución.')
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Configuración del Bot" description="Personaliza la identidad y personalidad del bot. Los cambios aplican desde el próximo mensaje." />
      {error && <div className="mb-4"><ErrorMsg message={error} /></div>}

      <div className="space-y-4">
        <Card>
          <h3 className="text-sm font-semibold text-on-surface mb-4">Identidad</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre del bot" hint="Cómo se presenta el bot">
              <Input {...register('bot_name')} placeholder="Sofia" />
            </Field>
            <Field label="Idioma">
              <Select options={LANGUAGES} {...register('language')} />
            </Field>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-on-surface mb-4">Personalidad</h3>
          <div className="space-y-4">
            <Field label="Tono">
              <Select options={TONES} {...register('tone')} />
            </Field>
            <Field label="Descripción de personalidad" hint="Descripción de texto libre inyectada al inicio del prompt del sistema">
              <Textarea
                rows={4}
                {...register('personality')}
                placeholder="Eres Sofia, una asistente de ventas amigable y profesional…"
              />
            </Field>
            <Field label="Mensaje de bienvenida" hint="Usado cuando el bot contacta a un cliente por primera vez">
              <Textarea
                rows={2}
                {...register('greeting')}
                placeholder="¡Hola! Soy Sofia 👋 ¡Bienvenido! ¿En qué te puedo ayudar hoy?"
              />
            </Field>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-on-surface mb-4">Notificaciones</h3>
          <Toggle
            checked={notifyEnabled}
            onChange={setNotifyEnabled}
            label="Notificar al cliente por WhatsApp al cambiar el estado del pedido"
          />
        </Card>

        <MetaCredentialsCard />
      </div>

      <SaveBar saving={isSubmitting} saved={saved} onSave={handleSubmit(onSubmit)} />
    </div>
  )
}
