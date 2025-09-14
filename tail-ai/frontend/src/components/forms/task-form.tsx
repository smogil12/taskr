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
  teamMembers?: TeamMember[]
}

interface TeamMember {
  id: string
  name: string
  email: string
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
  assignedTo?: string
}

export function TaskForm({ projectId, onSubmit, onCancel, initialData, isEditing = false, projects = [], teamMembers = [] }: TaskFormProps) {
  const [task, setTask] = useState<TaskData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    priority: initialData?.priority || "MEDIUM",
    status: initialData?.status || "TODO",
    dueDate: initialData?.dueDate || "",
    estimatedHours: initialData?.estimatedHours || "",
    actualHours: initialData?.actualHours || "",
    projectId: initialData?.projectId || projectId || "",
    assignedTo: initialData?.assignedTo || ""
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
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEditing ? "Edit Task" : "Add a new task to your project"}
          </h1>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-2">
          <div className="border-b border-gray-900/10 pb-4 dark:border-white/10">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Task Information</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Basic information about your task and its requirements.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-900 dark:text-white">
                  Task Title *
                </label>
                <div className="mt-1">
                  <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Enter task title"
                    value={task.title}
                    onChange={handleInputChange}
                    className={`block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500 ${errors.title ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.title && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.title}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="projectId" className="block text-sm font-medium text-gray-900 dark:text-white">
                  Project *
                </label>
                <div className="mt-1 relative">
                  <select
                    id="projectId"
                    name="projectId"
                    value={task.projectId}
                    onChange={handleInputChange}
                    disabled={isEditing}
                    className={`block w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800 dark:focus:outline-indigo-500 ${errors.projectId ? "border-red-500" : ""}`}
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
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
                {errors.projectId && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.projectId}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-900 dark:text-white">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="Describe the task in detail"
                    value={task.description}
                    onChange={handleInputChange}
                    className="block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Provide a detailed description of what needs to be done.</p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-900/10 pb-4 dark:border-white/10">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Task Configuration</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Set the priority, status, and timeline for this task.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-900 dark:text-white">
                  Priority
                </label>
                <div className="mt-1 relative">
                  <select
                    id="priority"
                    name="priority"
                    value={task.priority}
                    onChange={handleInputChange}
                    className="block w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800 dark:focus:outline-indigo-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
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
                <label htmlFor="status" className="block text-sm font-medium text-gray-900 dark:text-white">
                  Status
                </label>
                <div className="mt-1 relative">
                  <select
                    id="status"
                    name="status"
                    value={task.status}
                    onChange={handleInputChange}
                    className="block w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800 dark:focus:outline-indigo-500"
                  >
                    <option value="TODO">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Complete</option>
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
                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-900 dark:text-white">
                  Assignee
                </label>
                <div className="mt-1 relative">
                  <select
                    id="assignedTo"
                    name="assignedTo"
                    value={task.assignedTo}
                    onChange={handleInputChange}
                    className="block w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800 dark:focus:outline-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.email})
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
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-900 dark:text-white">
                  Due Date
                </label>
                <div className="mt-1">
                  <input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={task.dueDate}
                    onChange={handleInputChange}
                    className="block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-900/10 pb-4 dark:border-white/10">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Time Tracking</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Estimate and track the time spent on this task.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-900 dark:text-white">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Estimated Hours *
                </label>
                <div className="mt-1">
                  <input
                    id="estimatedHours"
                    name="estimatedHours"
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="Enter estimated hours"
                    value={task.estimatedHours}
                    onChange={handleInputChange}
                    className={`block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500 ${errors.estimatedHours ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.estimatedHours && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.estimatedHours}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="actualHours" className="block text-sm font-medium text-gray-900 dark:text-white">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Actual Hours {isCompleted && "*"}
                </label>
                <div className="mt-1">
                  <input
                    id="actualHours"
                    name="actualHours"
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="Enter actual hours"
                    value={task.actualHours}
                    onChange={handleInputChange}
                    disabled={!isCompleted}
                    className={`block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500 ${errors.actualHours ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.actualHours && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.actualHours}
                  </div>
                )}
                {!isCompleted && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Fill in actual hours when marking task as completed.</p>
                )}
              </div>
            </div>

            {/* Hours Summary */}
            {task.estimatedHours && task.actualHours && (
              <div className="mt-8 p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
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
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button 
            type="button" 
            onClick={onCancel}
            className="text-sm font-semibold text-gray-900 dark:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:focus-visible:outline-indigo-500"
          >
            {isEditing ? "Update Task" : "Create Task"}
          </button>
        </div>
      </form>
      </div>
    </div>
  )
}
