export function getRecaptchaToken(action) {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''
  return new Promise((resolve, reject) => {
    if (!window.grecaptcha) {
      reject(new Error('reCAPTCHA no cargado'))
      return
    }
    window.grecaptcha.ready(() => {
      window.grecaptcha.execute(siteKey, { action }).then(resolve).catch(reject)
    })
  })
}
