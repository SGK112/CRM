import React from 'react'
import { redirect } from 'next/navigation'

// Simple redirect to the existing clients/new onboarding page to keep routes working
export default function ContactsNewRedirect() {
  // Keep the canonical onboarding at /dashboard/clients/new
  if (typeof window === 'undefined') {
    redirect('/dashboard/clients/new')
  }

  // For client-side navigation, perform a location replace
  React.useEffect(() => {
    window.location.replace('/dashboard/clients/new')
  }, [])

  return <div />
}
