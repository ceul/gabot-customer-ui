import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { menu as api } from '../api'
import { PageHeader, Card, Field, Input, Textarea, Toggle, Button, Spinner, ErrorMsg } from '../components/ui'
import MenuImportModal from '../components/MenuImportModal'
import { Plus, Trash2, ChevronDown, ChevronRight, Upload } from 'lucide-react'

function ItemForm({ item, onSave, onDelete, onCancel }) {
  const { register, handleSubmit, control, formState: { isSubmitting } } = useForm({
    defaultValues: item ?? { name: '', description: '', price: '', is_available: true },
  })

  return (
    <div className="bg-surface-container-low/30 border border-outline-variant/30 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <Field label="Nombre">
            <Input {...register('name', { required: true })} placeholder="Nombre del producto" />
          </Field>
        </div>
        <Field label="Precio ($)">
          <Input type="number" min="0" step="1" {...register('price', { required: true })} placeholder="0" />
        </Field>
      </div>
      <Field label="Descripción">
        <Textarea rows={2} {...register('description')} placeholder="Descripción corta…" />
      </Field>
      <div className="flex items-center justify-between">
        <Controller
          name="is_available"
          control={control}
          render={({ field }) => (
            <Toggle checked={field.value} onChange={field.onChange} label="Disponible" />
          )}
        />
        <div className="flex gap-2">
          {onCancel && <Button variant="secondary" onClick={onCancel}>Cancelar</Button>}
          {onDelete && (
            <Button variant="danger" onClick={onDelete}>
              <Trash2 size={14} /> Eliminar
            </Button>
          )}
          <Button onClick={handleSubmit(onSave)} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : item ? 'Actualizar' : 'Agregar ítem'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function CategorySection({ cat, onUpdate, onDelete, onAddItem, onUpdateItem, onDeleteItem }) {
  const [open, setOpen] = useState(true)
  const [editingCat, setEditingCat] = useState(false)
  const [catName, setCatName] = useState(cat.name)
  const [addingItem, setAddingItem] = useState(false)
  const [editItemId, setEditItemId] = useState(null)

  const saveCat = async () => {
    await onUpdate(cat.id, { name: catName })
    setEditingCat(false)
  }

  return (
    <Card className="bg-surface border border-outline-variant/30 rounded-xl p-0 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors border-b border-outline-variant/20">
        <button onClick={() => setOpen(o => !o)} className="text-secondary hover:text-on-surface">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {editingCat ? (
          <input
            className="flex-1 px-2 py-1 text-sm border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-on-surface"
            value={catName}
            onChange={e => setCatName(e.target.value)}
            onBlur={saveCat}
            onKeyDown={e => e.key === 'Enter' && saveCat()}
            autoFocus
          />
        ) : (
          <span
            className="flex-1 font-space text-sm font-semibold text-on-surface cursor-pointer hover:text-primary"
            onClick={() => setEditingCat(true)}
          >
            {cat.name}
          </span>
        )}
        <span className="bg-surface-container text-secondary rounded-full px-2 py-0.5 text-xs">{cat.items?.length ?? 0} ítems</span>
        <Button variant="danger" onClick={() => onDelete(cat.id)}>
          <Trash2 size={14} />
        </Button>
      </div>

      {open && (
        <div className="p-4 space-y-3">
          {(cat.items ?? []).map(item =>
            editItemId === item.id ? (
              <ItemForm
                key={item.id}
                item={item}
                onSave={async data => { await onUpdateItem(item.id, data); setEditItemId(null) }}
                onDelete={async () => { await onDeleteItem(item.id); setEditItemId(null) }}
                onCancel={() => setEditItemId(null)}
              />
            ) : (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg border-t border-outline-variant/20 hover:bg-surface-container-low/50 cursor-pointer"
                onClick={() => setEditItemId(item.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${!item.is_available ? 'line-through text-secondary' : 'text-on-surface'}`}>
                    {item.name}
                  </p>
                  {item.description && (
                    <p className="text-xs text-secondary truncate">{item.description}</p>
                  )}
                </div>
                <span className="text-sm text-primary font-medium shrink-0">${Number(item.price).toLocaleString('es-CO')}</span>
                {!item.is_available && (
                  <span className="bg-error-container text-on-error-container rounded-full px-2 py-0.5 text-xs">No disponible</span>
                )}
              </div>
            )
          )}

          {addingItem ? (
            <ItemForm
              onSave={async data => { await onAddItem(cat.id, data); setAddingItem(false) }}
              onCancel={() => setAddingItem(false)}
            />
          ) : (
            <button
              onClick={() => setAddingItem(true)}
              className="flex items-center gap-2 text-sm text-primary hover:bg-primary/10 rounded-full font-medium py-1 px-2"
            >
              <Plus size={15} /> Agregar ítem
            </button>
          )}
        </div>
      )}
    </Card>
  )
}

export default function MenuPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingCat, setAddingCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    api.get()
      .then(setCategories)
      .catch(() => setError('No se pudo cargar el menú.'))
      .finally(() => setLoading(false))
  }, [])

  const addCategory = async () => {
    if (!newCatName.trim()) return
    const cat = await api.createCategory({ name: newCatName, display_order: categories.length })
    setCategories(prev => [...prev, { ...cat, items: [] }])
    setNewCatName(''); setAddingCat(false)
  }

  const updateCategory = async (id, data) => {
    const updated = await api.updateCategory(id, data)
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c))
  }

  const deleteCategory = async (id) => {
    if (!confirm('¿Eliminar esta categoría y todos sus ítems?')) return
    await api.deleteCategory(id)
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  const addItem = async (catId, data) => {
    const item = await api.createItem(catId, data)
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, items: [...(c.items ?? []), item] } : c))
  }

  const updateItem = async (itemId, data) => {
    const updated = await api.updateItem(itemId, data)
    setCategories(prev => prev.map(c => ({
      ...c,
      items: (c.items ?? []).map(i => i.id === itemId ? updated : i),
    })))
  }

  const deleteItem = async (itemId) => {
    await api.deleteItem(itemId)
    setCategories(prev => prev.map(c => ({
      ...c,
      items: (c.items ?? []).filter(i => i.id !== itemId),
    })))
  }

  if (loading) return <Spinner />

  return (
    <div className="bg-background">
      <PageHeader title="Menú" description="Organiza tu menú por categorías. Haz clic en un ítem para editarlo." />
      {error && <div className="mb-4"><ErrorMsg message={error} /></div>}

      {importing && (
        <MenuImportModal
          existingCategoryCount={categories.length}
          onClose={() => setImporting(false)}
          onImported={() => {
            setImporting(false)
            setLoading(true)
            api.get().then(setCategories).finally(() => setLoading(false))
          }}
        />
      )}

      <div className="space-y-4">
        {categories.map(cat => (
          <CategorySection
            key={cat.id}
            cat={cat}
            onUpdate={updateCategory}
            onDelete={deleteCategory}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onDeleteItem={deleteItem}
          />
        ))}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAddingCat(true)}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-full py-2 px-3"
          >
            <Plus size={16} /> Agregar categoría
          </button>
          <span className="text-outline">|</span>
          <button
            onClick={() => setImporting(true)}
            className="flex items-center gap-2 text-sm font-medium bg-primary text-on-primary rounded-full py-2 px-4"
          >
            <Upload size={16} /> Importar desde archivo
          </button>
        </div>

        {addingCat && (
          <Card>
            <div className="flex gap-3">
              <Input
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="Nombre de categoría (ej. Entradas)"
                onKeyDown={e => e.key === 'Enter' && addCategory()}
                autoFocus
              />
              <Button onClick={addCategory}>Agregar</Button>
              <Button variant="secondary" onClick={() => setAddingCat(false)}>Cancelar</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
