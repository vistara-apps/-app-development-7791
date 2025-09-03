import React, { useState } from 'react'
import AppShell from './components/AppShell'
import Dashboard from './components/Dashboard'

function App() {
  const [user] = useState({
    email: 'demo@insurance.com',
    subscriptionTier: 'Pro',
    photosThisMonth: 127,
    photoLimit: 500
  })

  return (
    <div className="min-h-screen gradient-bg">
      <AppShell user={user}>
        <Dashboard user={user} />
      </AppShell>
    </div>
  )
}

export default App