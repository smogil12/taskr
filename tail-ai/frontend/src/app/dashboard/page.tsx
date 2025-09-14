'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react'
import { ChevronRightIcon, ChevronUpDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { useAuth } from '@/components/providers/auth-provider'

// Helper function to calculate hours-based progress
function calculateHoursProgress(allocatedHours: number, consumedHours: number): number {
  if (!allocatedHours || allocatedHours <= 0) return 0;
  const progress = (consumedHours / allocatedHours) * 100;
  return Math.min(Math.max(progress, 0), 100); // Clamp between 0 and 100
}

// Types for real data
interface Project {
  id: string
  name: string
  description?: string
  status: 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'ON_HOLD'
  startDate: string
  endDate?: string
  progress: number
  allocatedHours: number
  consumedHours: number
  remainingHours: number
  client?: {
    name: string
  }
  createdAt: string
  updatedAt: string
}

interface Task {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: string
  projectId: string
  project?: {
    name: string
  }
  assignedUser?: {
    name: string
  }
  createdAt: string
  updatedAt: string
}

const statuses = {
  PLANNING: 'bg-gray-400 dark:bg-gray-500',
  IN_PROGRESS: 'bg-blue-500 dark:bg-blue-400',
  REVIEW: 'bg-yellow-500 dark:bg-yellow-400',
  COMPLETED: 'bg-green-500 dark:bg-green-400',
  ON_HOLD: 'bg-gray-500 dark:bg-gray-400',
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return `${Math.floor(diffInSeconds / 2592000)}w ago`
}

export default function DashboardPage() {
  const { user, token } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch projects and tasks from API
  useEffect(() => {
    if (token) {
      fetchData()
    }
  }, [token])

  const fetchData = async () => {
    if (!token) {
      console.error('No authentication token available')
      return
    }
    
    try {
      setIsLoading(true)
      setError(null)

      console.log('🔍 Fetching dashboard data with token:', token.substring(0, 20) + '...')

      // Fetch projects and tasks in parallel
      const [projectsResponse, tasksResponse] = await Promise.all([
        fetch('/api/projects', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('/api/tasks', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ])

      console.log('📊 Projects response status:', projectsResponse.status)
      console.log('📋 Tasks response status:', tasksResponse.status)

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        console.log('✅ Projects data:', projectsData)
        setProjects(projectsData.projects || projectsData || [])
      } else {
        const errorText = await projectsResponse.text()
        console.error('❌ Error fetching projects:', projectsResponse.status, errorText)
      }

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        console.log('✅ Tasks data:', tasksData)
        setTasks(tasksData.tasks || tasksData || [])
      } else {
        const errorText = await tasksResponse.text()
        console.error('❌ Error fetching tasks:', tasksResponse.status, errorText)
      }

    } catch (error) {
      console.error('❌ Error fetching data:', error)
      setError('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  // Get recent completed tasks for activity feed
  const recentTasks = tasks
    .filter(task => task.status === 'COMPLETED')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8)

  // Debug logging
  console.log('🔍 Dashboard state:', {
    projectsCount: projects.length,
    tasksCount: tasks.length,
    recentTasksCount: recentTasks.length,
    isLoading,
    error
  })

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading dashboard...</span>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button 
                onClick={fetchData}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-full overflow-x-hidden">
        {/* Sticky search header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-gray-200 bg-white px-4 shadow-xs sm:px-6 lg:px-8 dark:border-white/5 dark:bg-gray-900 dark:shadow-none">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <form action="#" method="GET" className="grid flex-1 grid-cols-1">
              <input
                name="search"
                placeholder="Search projects..."
                aria-label="Search projects"
                className="col-start-1 row-start-1 block size-full bg-transparent pl-8 text-base text-gray-900 outline-hidden placeholder:text-gray-400 sm:text-sm/6 dark:text-white dark:placeholder:text-gray-500"
              />
              <MagnifyingGlassIcon
                aria-hidden="true"
                className="pointer-events-none col-start-1 row-start-1 self-center text-gray-400 dark:text-gray-500"
                style={{ width: '20px', height: '20px' }}
              />
            </form>
          </div>
        </div>

        <div className="flex">
          <main className="flex-1 max-w-4xl min-h-0">
            <header className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 dark:border-white/5">
              <h1 className="text-base/7 font-semibold text-gray-900 dark:text-white">Projects</h1>

              {/* Sort dropdown */}
              <Menu as="div" className="relative">
                <MenuButton className="flex items-center gap-x-1 text-sm/6 font-medium text-gray-900 dark:text-white">
                  Sort by
                  <ChevronUpDownIcon aria-hidden="true" className="size-5 text-gray-500" />
                </MenuButton>
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2.5 w-40 origin-top-right rounded-md bg-white py-2 shadow-lg outline-1 outline-gray-900/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
                >
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-3 py-1 text-sm/6 text-gray-900 data-focus:bg-gray-50 data-focus:outline-hidden dark:text-white dark:data-focus:bg-white/5"
                    >
                      Name
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-3 py-1 text-sm/6 text-gray-900 data-focus:bg-gray-50 data-focus:outline-hidden dark:text-white dark:data-focus:bg-white/5"
                    >
                      Date updated
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-3 py-1 text-sm/6 text-gray-900 data-focus:bg-gray-50 data-focus:outline-hidden dark:text-white dark:data-focus:bg-white/5"
                    >
                      Status
                    </a>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </header>

            {/* Project list */}
            {projects.length === 0 ? (
              <div className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400">No projects found. Create your first project to get started!</p>
                </div>
              </div>
            ) : (
              <ul role="list" className="divide-y divide-gray-100 dark:divide-white/5">
                {projects.map((project) => (
                  <li key={project.id} className="relative flex items-center space-x-4 px-4 py-4 sm:px-6 lg:px-8">
                    <div className="min-w-0 flex-auto">
                      <div className="flex items-center gap-x-3">
                        <h2 className="min-w-0 text-sm font-medium text-gray-900 dark:text-white">
                          <a href={`/projects/${project.id}`} className="flex gap-x-2">
                            <span className="truncate">{project.client?.name || 'Personal'}</span>
                            <span className="text-gray-400">/</span>
                            <span className="whitespace-nowrap">{project.name}</span>
                            <span className="absolute inset-0" />
                          </a>
                        </h2>
                      </div>
                      <div className="mt-3 flex items-center gap-x-2.5 text-xs/5 text-gray-500 dark:text-gray-400">
                        <p className="truncate">{project.description || 'No description'}</p>
                        <p className="whitespace-nowrap">Updated {formatTimeAgo(project.updatedAt)}</p>
                      </div>
                      {project.allocatedHours > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                            {(() => {
                              const hoursProgress = calculateHoursProgress(project.allocatedHours, project.consumedHours || 0);
                              return (
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-300 ${
                                    hoursProgress >= 100 
                                      ? 'bg-green-600' 
                                      : hoursProgress >= 75 
                                      ? 'bg-yellow-500' 
                                      : 'bg-blue-600'
                                  }`}
                                  style={{ width: `${hoursProgress}%` }}
                                ></div>
                              );
                            })()}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.round(calculateHoursProgress(project.allocatedHours, project.consumedHours || 0))}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div
                      className={classNames(
                        statuses[project.status],
                        'flex-none rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset',
                      )}
                    >
                      {project.status.replace('_', ' ')}
                    </div>
                    <ChevronRightIcon 
                      aria-hidden="true" 
                      className="flex-none text-gray-400" 
                      style={{ width: '16px', height: '16px' }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </main>

          {/* Activity feed */}
          <aside className="w-96 bg-gray-50 border-l border-gray-200 dark:bg-gray-900 dark:border-white/5 overflow-y-auto">
              <header className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 dark:border-white/5">
                <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Activity feed</h2>
                <a href="/tasks" className="text-sm/6 font-semibold text-indigo-600 dark:text-indigo-400">
                  View all
                </a>
              </header>
              {recentTasks.length === 0 ? (
                <div className="px-4 py-8 sm:px-6 lg:px-8">
                  <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No completed tasks yet</p>
                  </div>
                </div>
              ) : (
                <ul role="list" className="divide-y divide-gray-100 dark:divide-white/5">
                  {recentTasks.map((task) => (
                    <li key={task.id} className="px-4 py-4 sm:px-6 lg:px-8">
                      <div className="flex items-center gap-x-3">
                        <div className="size-6 flex-none rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {(task.assignedUser?.name || user?.name || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <h3 className="flex-auto truncate text-sm/6 font-semibold text-gray-900 dark:text-white">
                          {task.assignedUser?.name || user?.name || 'Unknown User'}
                        </h3>
                        <time dateTime={task.updatedAt} className="flex-none text-xs text-gray-500 dark:text-gray-600">
                          {formatTimeAgo(task.updatedAt)}
                        </time>
                      </div>
                      <p className="mt-3 truncate text-sm text-gray-500">
                        Completed <span className="text-gray-700 dark:text-gray-400">{task.title}</span> in{' '}
                        <span className="text-gray-700 dark:text-gray-400">{task.project?.name || 'Unknown Project'}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              )}
          </aside>
        </div>
      </div>
    </MainLayout>
  )
}