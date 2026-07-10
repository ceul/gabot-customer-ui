import { useState } from 'react'

const ANSWER_TEXT = {
  yes: 'Sí, se puede.',
  no: 'No, no se puede.',
  decline: 'No he podido confirmar eso todavía, pero te aviso apenas tenga noticias.',
}

export default function PendingQuestionCard({ question, onResolve }) {
  const [alreadyAnswered, setAlreadyAnswered] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleClick = async (answer) => {
    if (submitting || alreadyAnswered) return
    setSubmitting(true)
    try {
      await onResolve(question.id, answer)
    } catch (err) {
      if (err?.response?.status === 409) {
        setAlreadyAnswered(true)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (alreadyAnswered) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-500">Esta pregunta ya fue respondida.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="mb-3 text-sm font-semibold text-amber-800">💬 Pregunta de cliente</p>
      <p className="mb-4 text-sm text-gray-900">{question.customer_question}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={submitting}
          onClick={() => handleClick(ANSWER_TEXT.yes)}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
        >
          Sí
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => handleClick(ANSWER_TEXT.no)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          No
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => handleClick(ANSWER_TEXT.decline)}
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50"
        >
          Rechazar
        </button>
      </div>
    </div>
  )
}
