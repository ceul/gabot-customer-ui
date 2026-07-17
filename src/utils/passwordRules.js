export const passwordRules = [
  { id: 'length', label: 'Mínimo 8 caracteres', test: pw => pw.length >= 8 },
  { id: 'uppercase', label: 'Una letra mayúscula', test: pw => /[A-Z]/.test(pw) },
  { id: 'lowercase', label: 'Una letra minúscula', test: pw => /[a-z]/.test(pw) },
  { id: 'number', label: 'Un número', test: pw => /[0-9]/.test(pw) },
]

export function isPasswordValid(password) {
  return passwordRules.every(rule => rule.test(password))
}
