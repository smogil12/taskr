'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { useTeamPermissions } from '@/hooks/useTeamPermissions'
import Link from 'next/link'

interface ProperShellProps {
  children: React.ReactNode
}

export default function ProperShell({ children }: ProperShellProps) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { permissions } = useTeamPermissions()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div style={{ height: '100%', backgroundColor: 'white' }}>
        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ animation: 'spin 1s linear infinite', borderRadius: '50%', height: '48px', width: '48px', borderBottom: '2px solid #2563eb', margin: '0 auto' }}></div>
            <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'transparent' }}>
      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '240px',
          backgroundColor: '#374151',
          borderRight: '1px solid #4b5563',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', padding: '1rem' }}>
            <nav style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
              <ul style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '1.75rem' }}>
                <li>
                  <ul style={{ marginLeft: '-0.5rem', marginRight: '-0.5rem' }}>
                    <li>
                      <Link
                        href="/dashboard"
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          textDecoration: 'none',
                          color: pathname === '/dashboard' ? '#ffffff' : '#d1d5db',
                          backgroundColor: pathname === '/dashboard' ? '#4b5563' : 'transparent'
                        }}
                      >
                        <svg style={{ width: '24px', height: '24px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/projects"
                        style={{
                          display: 'flex',
                          gap: '0.75rem',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          textDecoration: 'none',
                          color: pathname === '/projects' ? '#ffffff' : '#d1d5db',
                          backgroundColor: pathname === '/projects' ? '#4b5563' : 'transparent'
                        }}
                      >
                        <svg style={{ width: '24px', height: '24px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                        </svg>
                        Projects
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/tasks"
                        style={{
                          display: 'flex',
                          gap: '0.75rem',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          textDecoration: 'none',
                          color: pathname === '/tasks' ? '#ffffff' : '#d1d5db',
                          backgroundColor: pathname === '/tasks' ? '#4b5563' : 'transparent'
                        }}
                      >
                        <svg style={{ width: '24px', height: '24px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                        Tasks
                      </Link>
                    </li>

                    <li>
                      <Link
                        href="/clients"
                        style={{
                          display: 'flex',
                          gap: '0.75rem',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          textDecoration: 'none',
                          color: pathname === '/clients' ? '#ffffff' : '#d1d5db',
                          backgroundColor: pathname === '/clients' ? '#4b5563' : 'transparent'
                        }}
                      >
                        <svg style={{ width: '24px', height: '24px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                        </svg>
                        Clients
                      </Link>
                    </li>
                    {permissions.canAccessTeamMembers && (
                      <li>
                        <Link
                          href="/team-members"
                          style={{
                            display: 'flex',
                            gap: '0.75rem',
                            borderRadius: '6px',
                            padding: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            textDecoration: 'none',
                          color: pathname === '/team-members' ? '#ffffff' : '#d1d5db',
                          backgroundColor: pathname === '/team-members' ? '#4b5563' : 'transparent'
                          }}
                        >
                          <svg style={{ width: '24px', height: '24px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                          </svg>
                          Team Members
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link
                        href="/calendar"
                        style={{
                          display: 'flex',
                          gap: '0.75rem',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          textDecoration: 'none',
                          color: pathname === '/calendar' ? '#ffffff' : '#d1d5db',
                          backgroundColor: pathname === '/calendar' ? '#4b5563' : 'transparent'
                        }}
                      >
                        <svg style={{ width: '24px', height: '24px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                        Calendar
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/reports"
                        style={{
                          display: 'flex',
                          gap: '0.75rem',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          textDecoration: 'none',
                          color: pathname === '/reports' ? '#ffffff' : '#d1d5db',
                          backgroundColor: pathname === '/reports' ? '#4b5563' : 'transparent'
                        }}
                      >
                        <svg style={{ width: '24px', height: '24px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                        </svg>
                        Reports
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/plans"
                        style={{
                          display: 'flex',
                          gap: '0.75rem',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          textDecoration: 'none',
                          color: pathname === '/plans' ? '#ffffff' : '#d1d5db',
                          backgroundColor: pathname === '/plans' ? '#4b5563' : 'transparent'
                        }}
                      >
                        <svg style={{ width: '24px', height: '24px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                        </svg>
                        Plans
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/settings"
                        style={{
                          display: 'flex',
                          gap: '0.75rem',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          textDecoration: 'none',
                          color: pathname === '/settings' ? '#ffffff' : '#d1d5db',
                          backgroundColor: pathname === '/settings' ? '#4b5563' : 'transparent'
                        }}
                      >
                        <svg style={{ width: '24px', height: '24px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        Settings
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </nav>
            <div style={{ marginTop: 'auto', marginLeft: '-1rem', marginRight: '-1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem' }}>
                <div
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    backgroundColor: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.name || 'User'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#d1d5db', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  style={{ color: '#d1d5db' }}
                >
                  <span style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>Sign out</span>
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main style={{ paddingTop: '2.5rem', paddingLeft: '240px', backgroundColor: 'transparent', height: '100vh', overflow: 'auto' }}>
          <div style={{ padding: '0 1rem', backgroundColor: 'transparent', height: '100%' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
