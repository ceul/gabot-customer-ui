import BottomSheet from './BottomSheet'

const COP_FMT = new Intl.NumberFormat('es-CO', { style: 'decimal', minimumFractionDigits: 0 })

function formatCOP(amount) {
  return COP_FMT.format(Math.round(amount))
}

export default function UpsellCard({
  open,
  itemName,
  itemPrice,
  discountApplied,
  discountType,
  reason,
  onAccept,
  onDecline,
}) {
  const discountedPrice = discountApplied != null ? itemPrice - discountApplied : null
  const discountPct = discountApplied != null && discountType === 'pct'
    ? Math.round((discountApplied / itemPrice) * 100)
    : null

  const truncatedReason = reason && reason.length > 80 ? reason.slice(0, 80) + '…' : reason

  return (
    <BottomSheet open={open} onClose={onDecline} aria-labelledby="upsell-title">
      <div className="px-5 pb-6 pt-2">
        <p id="upsell-title" className="mb-3 text-sm font-semibold text-amber-700">
          💡 Sugerencia antes de confirmar
        </p>

        <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="font-semibold text-gray-900">{itemName}</p>
          <div className="mt-1 flex items-center gap-2">
            {discountedPrice != null ? (
              <>
                <span className="text-xs text-gray-400 line-through" aria-label={`antes COP ${formatCOP(itemPrice)}`}>
                  ${formatCOP(itemPrice)}
                </span>
                <span
                  className="font-semibold text-gray-900"
                  aria-label={`con descuento COP ${formatCOP(discountedPrice)}`}
                >
                  ${formatCOP(discountedPrice)}
                </span>
                {discountPct != null && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                    −{discountPct}%
                  </span>
                )}
              </>
            ) : (
              <span className="font-semibold text-gray-900">${formatCOP(itemPrice)}</span>
            )}
          </div>
        </div>

        {reason && (
          <p
            className="mb-5 truncate text-sm text-gray-600"
            aria-label={reason}
          >
            {truncatedReason}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onAccept}
            className="w-full rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-700 active:bg-amber-800"
          >
            ✓ Agregar
          </button>
          <button
            type="button"
            onClick={onDecline}
            className="w-full rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Confirmar sin agregar
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
