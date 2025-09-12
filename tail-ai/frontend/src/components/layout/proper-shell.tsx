'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import Link from 'next/link'

interface ProperShellProps {
  children: React.ReactNode
}

export default function ProperShell({ children }: ProperShellProps) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

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
          width: '288px',
          backgroundColor: 'white',
          borderRight: '1px solid #e5e7eb',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', borderRight: '1px solid #e5e7eb', backgroundColor: 'white', padding: '1.5rem' }}>
            <div style={{ display: 'flex', height: '64px', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4f46e5' }}>Taskr</span>
            </div>
            <nav style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
              <ul style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '1.75rem' }}>
                <li>
                  <ul style={{ marginLeft: '-0.5rem', marginRight: '-0.5rem' }}>
                    <li>
                      <Link
                        href="/dashboard"
                        style={{
                          display: 'flex',
                          gap: '0.75rem',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          textDecoration: 'none',
                          color: pathname === '/dashboard' ? '#4f46e5' : '#374151',
                          backgroundColor: pathname === '/dashboard' ? '#f9fafb' : 'transparent'
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
                          color: pathname === '/projects' ? '#4f46e5' : '#374151',
                          backgroundColor: pathname === '/projects' ? '#f9fafb' : 'transparent'
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
                          color: pathname === '/tasks' ? '#4f46e5' : '#374151',
                          backgroundColor: pathname === '/tasks' ? '#f9fafb' : 'transparent'
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
                          color: pathname === '/clients' ? '#4f46e5' : '#374151',
                          backgroundColor: pathname === '/clients' ? '#f9fafb' : 'transparent'
                        }}
                      >
                        <svg style={{ width: '24px', height: '24px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                        </svg>
                        Clients
                      </Link>
                    </li>
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
                          color: pathname === '/team-members' ? '#4f46e5' : '#374151',
                          backgroundColor: pathname === '/team-members' ? '#f9fafb' : 'transparent'
                        }}
                      >
                        <svg style={{ width: '24px', height: '24px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                        </svg>
                        Team
                      </Link>
                    </li>
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
                          color: pathname === '/calendar' ? '#4f46e5' : '#374151',
                          backgroundColor: pathname === '/calendar' ? '#f9fafb' : 'transparent'
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
                          color: pathname === '/reports' ? '#4f46e5' : '#374151',
                          backgroundColor: pathname === '/reports' ? '#f9fafb' : 'transparent'
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
                          color: pathname === '/plans' ? '#4f46e5' : '#374151',
                          backgroundColor: pathname === '/plans' ? '#f9fafb' : 'transparent'
                        }}
                      >
                        <svg style={{ width: '24px', height: '24px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                        </svg>
                        Plans
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </nav>
            <div style={{ marginTop: 'auto', marginLeft: '-1.5rem', marginRight: '-1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1.5rem' }}>
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
                  <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.name || 'User'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  style={{ color: '#9ca3af' }}
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
        <main style={{ paddingTop: '2.5rem', paddingLeft: '288px', backgroundColor: 'transparent', minHeight: '100vh' }}>
          <div style={{ padding: '0 1rem', backgroundColor: 'transparent' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
