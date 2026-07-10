import { useEffect, useRef } from 'react'

export default function GoogleSignInButton({ onCredential }) {
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!window.google || !buttonRef.current) return
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      callback: (response) => onCredential(response.credential),
    })
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      width: 320,
    })
  }, [onCredential])

  return <div ref={buttonRef} />
}
