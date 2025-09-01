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
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('taskr_token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
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

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "Planning":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Review":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Projects
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your projects and track their progress
          </p>
        </div>
        <Button onClick={() => setShowNewProjectForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No projects found. Create a new one!</p>
          </div>
        ) : (
          projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </div>
                <div className="flex gap-1">
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
              </div>
              <CardDescription className="line-clamp-2">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(project.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {project.allocatedHours}h allocated
                  </span>
                </div>
              </div>

              {/* Client Information */}
              {project.client && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {project.client.name} {project.client.company && `(${project.client.company})`}
                  </span>
                </div>
              )}

              {/* Hour Allocation Status */}
              {project.allocatedHours > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Hours Progress</span>
                    <span>{project.consumedHours}/{project.allocatedHours}h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        project.consumedHours / project.allocatedHours > 0.9 
                          ? 'bg-red-500' 
                          : project.consumedHours / project.allocatedHours > 0.7 
                          ? 'bg-yellow-500' 
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((project.consumedHours / project.allocatedHours) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {project.remainingHours}h remaining
                  </div>
                </div>
              )}

              {project.teamMembers && project.teamMembers.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {project.teamMembers.length} team member
                    {project.teamMembers.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))
        )}
      </div>
    </div>
  )
}

