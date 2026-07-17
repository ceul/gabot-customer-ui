import { Check, X } from 'lucide-react'
import { passwordRules } from '../utils/passwordRules'

export default function PasswordRequirements({ password, attempted }) {
  return (
    <ul className="flex flex-col gap-1 mt-1">
      {passwordRules.map(rule => {
        const passed = rule.test(password)
        const state = passed ? 'passed' : attempted ? 'error' : 'pending'
        const colorClass = {
          passed: 'text-green-600',
          error: 'text-error',
          pending: 'text-outline',
        }[state]

        return (
          <li key={rule.id} data-state={state} className={`flex items-center gap-1.5 text-xs ${colorClass}`}>
            {passed ? <Check size={14} /> : <X size={14} className={state === 'pending' ? 'opacity-40' : ''} />}
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}
