import { useEffect, useRef } from 'react'

export default function GoogleSignInButton({ onCredential }) {
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!window.google || !buttonRef.current) return

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID is not set — Google Sign-In will not work')
      return
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => onCredential(response.credential),
      })
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
      })
    } catch (err) {
      console.error('Google Sign-In failed to initialize', err)
    }
  }, [onCredential])

  return <div ref={buttonRef} />
}
