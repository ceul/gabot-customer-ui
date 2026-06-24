export default function TableChip({ label, selected = false, variant = 'default', onClick }) {
  const base = 'inline-flex items-center justify-center rounded-full px-4 h-11 text-sm font-medium cursor-pointer select-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600'

  let style = ''
  if (variant === 'takeout') {
    style = selected
      ? 'border-2 border-dashed border-amber-600 bg-amber-50 text-amber-800 ring-2 ring-amber-600'
      : 'border-2 border-dashed border-amber-400 bg-white text-amber-700'
  } else {
    style = selected
      ? 'bg-amber-600 text-white ring-2 ring-amber-600 ring-offset-1'
      : 'bg-white text-gray-700 border border-gray-300 hover:border-amber-400'
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${style}`}
    >
      {label}
    </button>
  )
}
