import { X } from 'lucide-react'

export default function WaiterAppBar({ title, onClose }) {
  return (
    <div className="flex items-center justify-between bg-amber-600 px-4 py-3 text-white">
      <span className="text-base font-semibold">{title}</span>
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-amber-700 active:bg-amber-800"
      >
        <X size={20} />
      </button>
    </div>
  )
}
