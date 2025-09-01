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
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleCreateTask = async (taskData: any) => {
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

  const handleUpdateTask = async (taskData: any) => {
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

  const getStatusColor = (status: Task["status"]) => {
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

  const getPriorityColor = (priority: Task["priority"]) => {
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

  const getStatusIcon = (status: Task["status"]) => {
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
      {/* Debug Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          <strong>Debug Info:</strong> User: {user?.name} ({user?.email}) | 
          Token: {token ? `${token.substring(0, 20)}...` : 'None'}
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your tasks and track their progress
          </p>
        </div>
        <Button onClick={() => setShowNewTaskForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Project Filter */}
      <div className="flex items-center gap-4">
        <Label htmlFor="project-filter">Filter by Project:</Label>
        <select
          id="project-filter"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="all">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

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

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              {selectedProject === "all" 
                ? "No tasks found. Create a new one!" 
                : "No tasks found for this project. Create a new one!"}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                  </div>
                  <div className="flex gap-1">
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
                </div>
                <CardDescription className="line-clamp-2">
                  {task.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                                     <span
                     className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                       task.status
                     )}`}
                   >
                     {task.status === 'TODO' ? 'Not Started' : 
                      task.status === 'IN_PROGRESS' ? 'In Progress' : 
                      task.status === 'COMPLETED' ? 'Complete' : task.status}
                   </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Priority</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <FolderOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {task.project.name}
                  </span>
                </div>

                {task.dueDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Est: {task.estimatedHours || 0}h
                    </span>
                  </div>
                  {task.actualHours !== undefined && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Actual: {task.actualHours}h
                      </span>
                    </div>
                  )}
                </div>

                {/* Hours Summary for completed tasks */}
                {task.status === "COMPLETED" && task.estimatedHours && task.actualHours && (
                  <div className="p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Hours Summary</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {task.actualHours}h / {task.estimatedHours}h
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-2 dark:bg-blue-700">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          task.actualHours > task.estimatedHours * 1.1
                            ? 'bg-red-500'
                            : task.actualHours > task.estimatedHours
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ 
                          width: `${Math.min((task.actualHours / task.estimatedHours) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="mt-1 text-xs text-blue-600 dark:text-blue-400 text-center">
                      {task.actualHours > task.estimatedHours
                        ? `${(task.actualHours - task.estimatedHours).toFixed(1)}h over estimate`
                        : `${(task.estimatedHours - task.actualHours).toFixed(1)}h under estimate`
                      }
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Created: {new Date(task.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
