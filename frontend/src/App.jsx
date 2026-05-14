import { useState } from 'react'
import AdminZonePage from './zones/admin/pages/AdminZonePage'
import UserZonePage from './zones/user/pages/UserZonePage'

const SESSION_DURATION_MS = 3 * 60 * 60 * 1000 // 3 hours

function getInitialAuth() {
  try {
    const stored = localStorage.getItem('app_auth_session')
    if (stored) {
      const session = JSON.parse(stored)
      const now = Date.now()
      if (now - session.timestamp < SESSION_DURATION_MS) {
        return { user: session.user }
      }
      localStorage.removeItem('app_auth_session')
    }
  } catch (error) {
    console.error('Error parsing session data', error)
  }
  return { user: null }
}

function App() {
  const initialAuth = getInitialAuth()
  const [authUser, setAuthUser] = useState(initialAuth.user)
  const [activeZone, setActiveZone] = useState(() => {
    return initialAuth.user?.role === 'admin' ? 'admin' : 'user'
  })

  function handleLoginSuccess(user, token) {
    setAuthUser(user)

    localStorage.setItem(
      'app_auth_session',
      JSON.stringify({
        user,
        token,
        timestamp: Date.now(),
      })
    )

    if (user.role === 'admin') {
      setActiveZone('admin')
    } else {
      setActiveZone('user')
    }
  }

  function handleLogout() {
    if (authUser?.email) {
      localStorage.removeItem(`app_chat_session:${authUser.email}`)
    }
    setAuthUser(null)
    localStorage.removeItem('app_auth_session')
    setActiveZone('user')
  }

  if (activeZone === 'admin' && authUser?.role === 'admin') {
    return (
      <AdminZonePage
        authUser={authUser}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <UserZonePage
      authUser={authUser}
      onLoginSuccess={handleLoginSuccess}
      onLogout={handleLogout}
      onRequestAdminZone={() => {
        if (authUser?.role === 'admin') {
          setActiveZone('admin')
        }
      }}
    />
  )
}

export default App
