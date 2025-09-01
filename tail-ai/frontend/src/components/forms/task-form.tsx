"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, Calendar, AlertCircle } from "lucide-react"

interface TaskFormProps {
  projectId: string
  onSubmit: (task: TaskData) => void
  onCancel: () => void
  initialData?: Partial<TaskData>
  isEditing?: boolean
  projects?: Project[]
}

interface Project {
  id: string
  name: string
  description?: string
}

interface TaskData {
  title: string
  description: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  status: "TODO" | "IN_PROGRESS" | "COMPLETED"
  dueDate: string
  estimatedHours: string
  actualHours?: string
  projectId: string
}

export function TaskForm({ projectId, onSubmit, onCancel, initialData, isEditing = false, projects = [] }: TaskFormProps) {
  const [task, setTask] = useState<TaskData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    priority: initialData?.priority || "MEDIUM",
    status: initialData?.status || "TODO",
    dueDate: initialData?.dueDate || "",
    estimatedHours: initialData?.estimatedHours || "",
    actualHours: initialData?.actualHours || "",
    projectId: initialData?.projectId || projectId || ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTask(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!task.title.trim()) {
      newErrors.title = "Task title is required"
    }

    if (!task.projectId) {
      newErrors.projectId = "Project is required"
    }

    if (!task.estimatedHours || parseFloat(task.estimatedHours) <= 0) {
      newErrors.estimatedHours = "Estimated hours must be greater than 0"
    }

    if (task.status === "COMPLETED" && (!task.actualHours || parseFloat(task.actualHours) <= 0)) {
      newErrors.actualHours = "Actual hours are required when completing a task"
    }

    if (task.actualHours && parseFloat(task.actualHours) < 0) {
      newErrors.actualHours = "Actual hours cannot be negative"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const taskData: TaskData = {
      ...task,
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours || undefined
    }

    onSubmit(taskData)
  }

  const isCompleted = task.status === "COMPLETED"

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Task" : "Create New Task"}</CardTitle>
        <CardDescription>
          {isEditing ? "Update task information and hours" : "Add a new task to your project"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter task title"
              value={task.title}
              onChange={handleInputChange}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                {errors.title}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectId">Project *</Label>
            <select
              id="projectId"
              name="projectId"
              value={task.projectId}
              onChange={handleInputChange}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.projectId ? "border-red-500" : ""}`}
              disabled={isEditing}
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.projectId && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                {errors.projectId}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe the task in detail"
              value={task.description}
              onChange={handleInputChange}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                name="priority"
                value={task.priority}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={task.status}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="TODO">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Complete</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={task.dueDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">
                <Clock className="h-4 w-4 inline mr-2" />
                Estimated Hours *
              </Label>
              <Input
                id="estimatedHours"
                name="estimatedHours"
                type="number"
                step="0.5"
                min="0"
                placeholder="Enter estimated hours"
                value={task.estimatedHours}
                onChange={handleInputChange}
                className={errors.estimatedHours ? "border-red-500" : ""}
              />
              {errors.estimatedHours && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {errors.estimatedHours}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualHours">
                <Clock className="h-4 w-4 inline mr-2" />
                Actual Hours {isCompleted && "*"}
              </Label>
              <Input
                id="actualHours"
                name="actualHours"
                type="number"
                step="0.5"
                min="0"
                placeholder="Enter actual hours"
                value={task.actualHours}
                onChange={handleInputChange}
                className={errors.actualHours ? "border-red-500" : ""}
                disabled={!isCompleted}
              />
              {errors.actualHours && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {errors.actualHours}
                </div>
              )}
              {!isCompleted && (
                <div className="text-xs text-gray-500">
                  Fill in actual hours when marking task as completed
                </div>
              )}
            </div>
          </div>

          {/* Hours Summary */}
          {task.estimatedHours && task.actualHours && (
            <div className="p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Hours Summary</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {task.actualHours}h / {task.estimatedHours}h
                </span>
              </div>
              <div className="mt-2 w-full bg-blue-200 rounded-full h-2 dark:bg-blue-700">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    parseFloat(task.actualHours) > parseFloat(task.estimatedHours) * 1.1
                      ? 'bg-red-500'
                      : parseFloat(task.actualHours) > parseFloat(task.estimatedHours)
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ 
                    width: `${Math.min((parseFloat(task.actualHours) / parseFloat(task.estimatedHours)) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              <div className="mt-1 text-xs text-blue-600 dark:text-blue-400 text-center">
                {parseFloat(task.actualHours) > parseFloat(task.estimatedHours)
                  ? `${(parseFloat(task.actualHours) - parseFloat(task.estimatedHours)).toFixed(1)}h over estimate`
                  : `${(parseFloat(task.estimatedHours) - parseFloat(task.actualHours)).toFixed(1)}h under estimate`
                }
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit">
              {isEditing ? "Update Task" : "Create Task"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
