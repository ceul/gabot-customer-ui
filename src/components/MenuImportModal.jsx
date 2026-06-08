import { useRef, useState } from 'react'
import { menu as api } from '../api'
import { Button, Spinner } from './ui'
import { Upload, FileText, X, CheckSquare, Square, AlertCircle } from 'lucide-react'

const ACCEPTED = '.pdf,.txt,.csv,.docx,.xlsx,.xls'

function CategoryPreview({ cat, selected, onToggleCat, onToggleItem }) {
  const allSelected = cat.items.every(i => selected.has(`${cat.name}::${i.name}`))

  return (
    <div className="border border-outline-variant/30 rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-2 bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors"
        onClick={() => onToggleCat(cat)}
      >
        <span className="text-secondary">
          {allSelected ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
        </span>
        <span className="font-space text-sm font-semibold text-on-surface flex-1">{cat.name}</span>
        <span className="bg-surface-container text-secondary rounded-full px-2 py-0.5 text-xs">{cat.items.length} ítems</span>
      </div>
      <div className="divide-y divide-outline-variant/20">
        {cat.items.map(item => {
          const key = `${cat.name}::${item.name}`
          const checked = selected.has(key)
          return (
            <div
              key={key}
              className="flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:bg-surface-container-low/50"
              onClick={() => onToggleItem(key)}
            >
              <span className="mt-0.5 text-secondary shrink-0">
                {checked ? <CheckSquare size={15} className="text-primary" /> : <Square size={15} />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-on-surface">{item.name}</p>
                {item.description && (
                  <p className="text-xs text-secondary truncate">{item.description}</p>
                )}
              </div>
              <span className="text-sm text-primary font-medium shrink-0">
                ${Number(item.price).toLocaleString('es-CO')}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function MenuImportModal({ onClose, onImported, existingCategoryCount }) {
  const inputRef = useRef()
  const [stage, setStage] = useState('idle')
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [dragOver, setDragOver] = useState(false)

  const handleFile = async (file) => {
    setError(null)
    setStage('uploading')
    try {
      const data = await api.importFile(file)
      setPreview(data)
      const keys = new Set()
      for (const cat of data.categories ?? []) {
        for (const item of cat.items ?? []) {
          keys.add(`${cat.name}::${item.name}`)
        }
      }
      setSelected(keys)
      setStage('preview')
    } catch (e) {
      setError(e?.response?.data?.error || 'Error al subir el archivo. Verifica que el servidor esté activo.')
      setStage('idle')
    }
  }

  const toggleCat = (cat) => {
    const keys = cat.items.map(i => `${cat.name}::${i.name}`)
    const allOn = keys.every(k => selected.has(k))
    setSelected(prev => {
      const next = new Set(prev)
      keys.forEach(k => allOn ? next.delete(k) : next.add(k))
      return next
    })
  }

  const toggleItem = (key) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const handleImport = async () => {
    setStage('importing')
    setError(null)
    try {
      let order = existingCategoryCount
      for (const cat of preview.categories ?? []) {
        const itemsToAdd = cat.items.filter(i => selected.has(`${cat.name}::${i.name}`))
        if (!itemsToAdd.length) continue
        const created = await api.createCategory({ name: cat.name, display_order: order++ })
        for (const item of itemsToAdd) {
          await api.createItem(created.id, {
            name: item.name,
            price: item.price,
            description: item.description || '',
            is_available: true,
          })
        }
      }
      onImported()
    } catch (e) {
      setError(e?.response?.data?.error || 'Error al importar.')
      setStage('preview')
    }
  }

  const selectedCount = selected.size

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/20 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl border border-outline-variant/20 shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
          <h2 className="font-space text-base font-semibold text-on-surface">Importar menú desde archivo</h2>
          <button onClick={onClose} className="text-secondary hover:text-on-surface">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-error-container border border-error-container text-on-error-container text-sm rounded-lg px-4 py-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {(stage === 'idle' || stage === 'uploading') && (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
              onClick={() => stage === 'idle' && inputRef.current.click()}
              className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-12 cursor-pointer transition-colors
                ${dragOver ? 'border-primary bg-primary/10' : 'border-outline-variant hover:border-primary hover:bg-surface-container-low'}
                ${stage === 'uploading' ? 'pointer-events-none opacity-60' : ''}`}
            >
              {stage === 'uploading' ? (
                <>
                  <Spinner />
                  <p className="text-sm text-secondary">Extrayendo y analizando el menú…</p>
                </>
              ) : (
                <>
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Upload size={22} className="text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-on-surface">Arrastra un archivo aquí o haz clic para buscar</p>
                    <p className="text-xs text-secondary mt-1">PDF, TXT, CSV, Word (.docx), Excel (.xlsx)</p>
                  </div>
                </>
              )}
            </div>
          )}

          {stage === 'preview' && preview && (
            <>
              <div className="flex items-center gap-2 text-sm text-secondary">
                <FileText size={15} />
                <span>Se encontraron <strong>{preview.categories?.length ?? 0}</strong> categorías — selecciona los ítems a importar</span>
              </div>
              <div className="space-y-2">
                {(preview.categories ?? []).map(cat => (
                  <CategoryPreview
                    key={cat.name}
                    cat={cat}
                    selected={selected}
                    onToggleCat={toggleCat}
                    onToggleItem={toggleItem}
                  />
                ))}
              </div>
            </>
          )}

          {stage === 'importing' && (
            <div className="flex flex-col items-center gap-3 py-10">
              <Spinner />
              <p className="text-sm text-secondary">Guardando ítems en la base de datos…</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/20">
          <button onClick={onClose} className="text-sm text-secondary hover:text-on-surface">Cancelar</button>
          {stage === 'preview' && (
            <Button onClick={handleImport} disabled={selectedCount === 0}>
              Importar {selectedCount} ítem{selectedCount !== 1 ? 's' : ''}
            </Button>
          )}
          {stage === 'idle' && (
            <Button onClick={() => inputRef.current.click()}>
              <Upload size={15} /> Elegir archivo
            </Button>
          )}
        </div>

        <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden" onChange={e => { const f = e.target.files[0]; if (f) handleFile(f) }} />
      </div>
    </div>
  )
}
