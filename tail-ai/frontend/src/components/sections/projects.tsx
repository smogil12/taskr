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
        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
            <CardDescription>
              Add a new project to your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter project name"
                    value={newProject.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={newProject.status}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Describe your project"
                  value={newProject.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={newProject.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={newProject.endDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client (Optional)</Label>
                  <select
                    id="clientId"
                    name="clientId"
                    value={newProject.clientId}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.company && `(${client.company})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allocatedHours">Allocated Hours</Label>
                  <Input
                    id="allocatedHours"
                    name="allocatedHours"
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="Enter allocated hours"
                    value={newProject.allocatedHours}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Project</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewProjectForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
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
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button
              onClick={() => setShowNewProjectForm(true)}
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add project
            </Button>
          </div>
        </div>
        <div className="mt-8 flow-root">
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
                <table className="relative min-w-full divide-y divide-gray-300 dark:divide-white/15">
                    <thead>
                      <tr>
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
                        Progress
                      </th>
                      <th scope="col" className="py-3.5 pr-4 pl-3 sm:pr-0">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                    {projects.map((project) => (
                      <tr key={project.id}>
                        <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0 dark:text-white">
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 text-blue-600" />
                            {project.name}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                            {project.description}
                          </p>
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              project.status
                            )}`}
                          >
                            {formatStatus(project.status)}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {project.client ? (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {project.client.name}
                              {project.client.company && (
                                <span className="text-xs text-gray-400">({project.client.company})</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">No client</span>
                          )}
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(project.startDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {project.allocatedHours || 0}h
                          </div>
                          {project.allocatedHours > 0 && (
                            <div className="text-xs text-gray-400 mt-1">
                              {project.consumedHours || 0}h used
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
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
                        <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteProject(project.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

