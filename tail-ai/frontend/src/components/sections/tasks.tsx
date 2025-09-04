"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Clock, Calendar, Edit, Trash2, FolderOpen, CheckCircle, AlertCircle, Play, Square } from "lucide-react"
import { TaskForm } from "@/components/forms/task-form"

interface Task {
  id: string
  title: string
  description?: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  status: "TODO" | "IN_PROGRESS" | "COMPLETED"
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  projectId: string
  project: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

interface Project {
  id: string
  name: string
  description?: string
  status: string
  allocatedHours: number
  consumedHours: number
  remainingHours: number
  client?: {
    id: string
    name: string
    company?: string
  }
}

export function Tasks() {
  const { user, token } = useAuth()
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string>("all")

  // Fetch tasks and projects from API
  useEffect(() => {
    if (token) {
      fetchTasks()
      fetchProjects()
    }
  }, [token])

  const fetchTasks = async () => {
    if (!token) {
      console.error('No authentication token available for fetching tasks')
      return
    }
    
    console.log('Fetching tasks with token:', token.substring(0, 20) + '...')
    
    try {
      setIsLoading(true)
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Tasks response status:', response.status)
      console.log('Tasks response ok:', response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Tasks fetched successfully:', data)
        setTasks(data.tasks || data)
      } else if (response.status === 401) {
        // Token expired, clear it
        console.log('Token expired, clearing auth state')
        localStorage.removeItem('taskr_token')
        // Optionally redirect to login
        window.location.href = '/auth/signin'
      } else {
        const errorText = await response.text()
        console.error('Error fetching tasks - response text:', errorText)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProjects = async () => {
    if (!token) return
    
    try {
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || data)
      } else if (response.status === 401) {
        // Token expired, clear it
        console.log('Token expired, clearing auth state')
        localStorage.removeItem('taskr_token')
        // Optionally redirect to login
        window.location.href = '/auth/signin'
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleCreateTask = async (taskData: unknown) => {
    if (!token) {
      console.error('No authentication token available')
      return
    }
    
    console.log('Creating task with token:', token.substring(0, 20) + '...')
    console.log('Task data:', taskData)
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...taskData,
          projectId: taskData.projectId
        })
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log('Task created successfully:', data)
        await fetchTasks()
        setShowNewTaskForm(false)
      } else {
        const errorText = await response.text()
        console.error('Error response text:', errorText)
        let error
        try {
          error = JSON.parse(errorText)
        } catch (e) {
          error = { message: errorText }
        }
        console.error('Error creating task:', error)
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleUpdateTask = async (taskData: unknown) => {
    if (!editingTask) return

    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      })

      if (response.ok) {
        await fetchTasks()
        await fetchProjects() // Refresh projects to update hours
        setEditingTask(null)
      } else {
        const error = await response.json()
        console.error('Error updating task:', error)
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchTasks()
      } else {
        const error = await response.json()
        console.error('Error deleting task:', error)
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const formatStatus = (status: string) => {
    switch (status) {
      case "TODO":
        return "Not Started"
      case "IN_PROGRESS":
        return "In Progress"
      case "COMPLETED":
        return "Complete"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "MEDIUM":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "HIGH":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "URGENT":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "TODO":
        return <Square className="h-4 w-4" />
      case "IN_PROGRESS":
        return <Play className="h-4 w-4" />
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Square className="h-4 w-4" />
    }
  }

  const filteredTasks = selectedProject === "all" 
    ? tasks 
    : tasks.filter(task => task.projectId === selectedProject)

  // Show loading or redirect if not authenticated
  if (!token) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Please sign in to view and manage your tasks.
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              <strong>Debug Info:</strong> No authentication token found. 
              Please go to <a href="/auth/signin" className="underline">Sign In</a> or 
              <a href="/auth/signup" className="underline ml-2">Sign Up</a> first.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* New Task Form */}
      {showNewTaskForm && (
        <TaskForm
          projectId=""
          onSubmit={handleCreateTask}
          onCancel={() => setShowNewTaskForm(false)}
          projects={projects}
        />
      )}

      {/* Edit Task Form */}
      {editingTask && (
        <TaskForm
          projectId={editingTask.projectId}
          onSubmit={handleUpdateTask}
          onCancel={() => setEditingTask(null)}
          initialData={{
            title: editingTask.title,
            description: editingTask.description || "",
            priority: editingTask.priority,
            status: editingTask.status,
            dueDate: editingTask.dueDate || "",
            estimatedHours: editingTask.estimatedHours?.toString() || "",
            actualHours: editingTask.actualHours?.toString() || ""
          }}
          isEditing={true}
          projects={projects}
        />
      )}

      {/* Tasks Table */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">Tasks</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              A list of all your tasks including their status, priority, project, and due dates.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button
              onClick={() => setShowNewTaskForm(true)}
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add task
            </Button>
          </div>
        </div>

        {/* Project Filter */}
        <div className="mt-4 flex items-center gap-4">
          <Label htmlFor="project-filter" className="text-sm text-gray-700 dark:text-gray-300">Filter by Project:</Label>
          <select
            id="project-filter"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="flex h-8 w-full max-w-xs rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="all">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedProject === "all" 
                      ? "No tasks found. Create a new one!" 
                      : "No tasks found for this project. Create a new one!"}
                  </p>
                </div>
              ) : (
                <table className="relative min-w-full divide-y divide-gray-300 dark:divide-white/15">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0 dark:text-white"
                      >
                        Title
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Priority
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Project
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Due Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Hours
                      </th>
                      <th scope="col" className="py-3.5 pr-4 pl-3 sm:pr-0">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                    {filteredTasks.map((task) => (
                      <tr key={task.id}>
                        <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0 dark:text-white">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(task.status)}
                            {task.title}
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                              {task.description}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {formatStatus(task.status)}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <FolderOpen className="h-3 w-3" />
                            {task.project.name}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {task.dueDate ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-gray-400">No due date</span>
                          )}
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.estimatedHours || 0}h est
                          </div>
                          {task.actualHours !== undefined && (
                            <div className="text-xs text-gray-400 mt-1">
                              {task.actualHours}h actual
                            </div>
                          )}
                        </td>
                        <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingTask(task)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTask(task.id)}
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
