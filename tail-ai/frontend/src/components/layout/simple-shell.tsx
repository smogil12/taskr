'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { HomeIcon, FolderIcon, DocumentDuplicateIcon, UserGroupIcon, ChartPieIcon, CalendarIcon } from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'Tasks', href: '/tasks', icon: DocumentDuplicateIcon },
  { name: 'Clients', href: '/clients', icon: UserGroupIcon },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'Reports', href: '/reports', icon: ChartPieIcon },
]

interface SimpleShellProps {
  children: React.ReactNode
}

export default function SimpleShell({ children }: SimpleShellProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  console.log('🔍 SimpleShell rendering with pathname:', pathname)
  console.log('🔍 SimpleShell user:', user)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-yellow-500 p-4 text-black font-bold">
        SIMPLE SHELL IS RENDERING!
      </div>
      {/* Simple sidebar - always visible */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50">
        <div className="flex h-16 items-center px-6">
          <span className="text-2xl font-bold text-indigo-600">Taskr</span>
        </div>
        <nav className="px-6">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        
        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <img
              alt=""
              src={user?.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
