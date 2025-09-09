"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, FolderOpen, Calendar, Users, Clock, Edit, Trash2, Building2 } from "lucide-react"

interface Project {
  id: number
  name: string
  description: string
  status: "Planning" | "In Progress" | "Review" | "Completed"
  startDate: string
  endDate?: string
  progress: number
  teamMembers: string[]
  allocatedHours: number
  consumedHours: number
  remainingHours: number
  clientId?: string
  client?: {
    id: string
    name: string
    company?: string
  }
}

interface Client {
  id: string
  name: string
  company?: string
}

export function Projects() {
  const { user } = useAuth()
  const [showNewProjectForm, setShowNewProjectForm] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)

  console.log('🔍 Projects component rendering with user:', user)
  console.log('🔍 Projects state:', projects)
  console.log('🔍 Loading state:', isLoading)

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "Planning" as Project["status"],
    startDate: "",
    endDate: "",
    allocatedHours: "",
    clientId: ""
  })

  // Fetch projects and clients from API
  useEffect(() => {
    fetchProjects()
    fetchClients()
  }, [])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      console.log('🔍 Fetching projects...')
      const token = localStorage.getItem('taskr_token')
      console.log('🔍 Token:', token ? 'Present' : 'Missing')
      
      if (!token) {
        console.log('🔍 No token available, skipping projects fetch')
        return
      }
      
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      console.log('🔍 Projects response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Projects data:', data)
        setProjects(data.projects || data)
      } else if (response.status === 401) {
        // Token expired, clear it
        console.log('🔍 Token expired, clearing auth state')
        localStorage.removeItem('taskr_token')
        // Optionally redirect to login
        window.location.href = '/auth/signin'
      } else {
        const errorText = await response.text()
        console.error('🔍 Projects API error:', response.status, errorText)
      }
    } catch (error) {
      console.error('🔍 Error fetching projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('taskr_token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const formatStatus = (status: string) => {
    switch (status) {
      case "PLANNING":
        return "Planning"
      case "IN_PROGRESS":
        return "In Progress"
      case "REVIEW":
        return "Review"
      case "COMPLETED":
        return "Completed"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLANNING":
      case "Planning":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "IN_PROGRESS":
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "REVIEW":
      case "Review":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "COMPLETED":
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewProject({
      ...newProject,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('taskr_token')}`
        },
        body: JSON.stringify({
          name: newProject.name,
          description: newProject.description,
          status: newProject.status.toUpperCase().replace(' ', '_'),
          startDate: newProject.startDate,
          endDate: newProject.endDate || null,
          allocatedHours: newProject.allocatedHours ? parseFloat(newProject.allocatedHours) : null,
          clientId: newProject.clientId || null
        })
      })

      if (response.ok) {
        await fetchProjects() // Refresh the projects list
        setNewProject({
          name: "",
          description: "",
          status: "Planning",
          startDate: "",
          endDate: "",
          allocatedHours: "",
          clientId: ""
        })
        setShowNewProjectForm(false)
      } else {
        const error = await response.json()
        console.error('Error creating project:', error)
      }
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const deleteProject = (id: number) => {
    setProjects(projects.filter((project) => project.id !== id))
  }

  return (
    <div className="space-y-6">
      
      {/* New Project Form */}
      {showNewProjectForm && (
        <div className="bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Add a new project to your portfolio</h1>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <div className="border-b border-gray-900/10 pb-4 dark:border-white/10">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Project Information</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Basic information about your project and its timeline.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-white">
                      Project Name *
                    </label>
                    <div className="mt-1">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter project name"
                        value={newProject.name}
                        onChange={handleInputChange}
                        required
                        className="block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-900 dark:text-white">
                      Status
                    </label>
                    <div className="mt-1 relative">
                      <select
                        id="status"
                        name="status"
                        value={newProject.status}
                        onChange={handleInputChange}
                        className="block w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800 dark:focus:outline-indigo-500"
                      >
                        <option value="Planning">Planning</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <svg
                        aria-hidden="true"
                        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                        fill="none"
                        viewBox="0 0 20 20"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M6 8l4 4 4-4"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-900 dark:text-white">
                      Description *
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        placeholder="Describe your project"
                        value={newProject.description}
                        onChange={handleInputChange}
                        required
                        className="block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-900 dark:text-white">
                      Start Date *
                    </label>
                    <div className="mt-1">
                      <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={newProject.startDate}
                        onChange={handleInputChange}
                        required
                        className="block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-900 dark:text-white">
                      End Date (Optional)
                    </label>
                    <div className="mt-1">
                      <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={newProject.endDate}
                        onChange={handleInputChange}
                        className="block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-900/10 pb-4 dark:border-white/10">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Project Details</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Additional project configuration and client assignment.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="clientId" className="block text-sm font-medium text-gray-900 dark:text-white">
                      Client (Optional)
                    </label>
                    <div className="mt-1 relative">
                      <select
                        id="clientId"
                        name="clientId"
                        value={newProject.clientId}
                        onChange={handleInputChange}
                        className="block w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800 dark:focus:outline-indigo-500"
                      >
                        <option value="">Select a client</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name} {client.company && `(${client.company})`}
                          </option>
                        ))}
                      </select>
                      <svg
                        aria-hidden="true"
                        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                        fill="none"
                        viewBox="0 0 20 20"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M6 8l4 4 4-4"
                        />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="allocatedHours" className="block text-sm font-medium text-gray-900 dark:text-white">
                      Allocated Hours
                    </label>
                    <div className="mt-1">
                      <input
                        id="allocatedHours"
                        name="allocatedHours"
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="Enter allocated hours"
                        value={newProject.allocatedHours}
                        onChange={handleInputChange}
                        className="block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button 
                type="button" 
                onClick={() => setShowNewProjectForm(false)}
                className="text-sm/6 font-semibold text-gray-900 dark:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:focus-visible:outline-indigo-500"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}

                  {/* Projects Table */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">Projects</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              A list of all your projects including their status, client, start date, and allocated hours.
            </p>
          </div>
          <div className="mt-6 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => setShowNewProjectForm(true)}
              className="rounded-full bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add project
            </button>
          </div>
        </div>
        <div className="mt-12 flow-root projects-table-container">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">Loading projects...</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">No projects found. Create a new one!</p>
                </div>
              ) : (
                                  <table className="relative min-w-full border-collapse projects-table">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-white/5">
                      <th
                        scope="col"
                        className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0 dark:text-white"
                      >
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Client
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Start Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Allocated Hours
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Hours Remaining
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Progress
                      </th>
                      <th scope="col" className="py-3.5 pr-4 pl-3 sm:pr-0">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project, index) => (
                      <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150">
                        <td className="text-sm font-medium whitespace-nowrap text-gray-900 dark:text-white">
                          {project.name}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                            {project.description}
                          </p>
                        </td>
                        <td className="text-sm whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              project.status
                            )}`}
                          >
                            {formatStatus(project.status)}
                          </span>
                        </td>
                        <td className=" text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {project.client ? (
                            <div>
                              {project.client.name}
                              {project.client.company && (
                                <span className="text-xs text-gray-400">({project.client.company})</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">No client</span>
                          )}
                        </td>
                        <td className=" text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {new Date(project.startDate).toLocaleDateString()}
                        </td>
                        <td className=" text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {project.allocatedHours || 0}h
                          {project.allocatedHours > 0 && (
                            <div className="text-xs text-gray-400 mt-1">
                              {project.consumedHours || 0}h used
                            </div>
                          )}
                        </td>
                        <td className=" text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {project.allocatedHours ? (project.allocatedHours - (project.consumedHours || 0)) : 0}h
                        </td>
                        <td className=" text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <span>{project.progress || 0}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${project.progress || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className=" text-right text-sm font-medium whitespace-nowrap sm:pr-0">
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              className="rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500 flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProject(project.id)}
                              className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:bg-red-500 dark:shadow-none dark:hover:bg-red-400 dark:focus-visible:outline-red-500 flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

