"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play, Square, Clock, Calendar, FolderOpen } from "lucide-react"

interface TimeEntry {
  id: string
  project: string
  task: string
  startTime: Date
  endTime?: Date
  duration?: number
  description?: string
}

export function TimeTracking() {
  const { user } = useAuth()
  const [isTracking, setIsTracking] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<Partial<TimeEntry> | null>(null)
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [elapsedTime, setElapsedTime] = useState(0)
  const [formData, setFormData] = useState({
    project: "",
    task: "",
    description: "",
  })

  // Mock projects - will be replaced with real data from API
  const projects = [
    { id: 1, name: "Website Redesign" },
    { id: 2, name: "Mobile App" },
    { id: 3, name: "Marketing Campaign" },
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTracking && currentEntry?.startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - currentEntry.startTime!.getTime())
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTracking, currentEntry])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    return `${hours.toString().padStart(2, "0")}:${(minutes % 60)
      .toString()
      .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
  }

  const startTracking = () => {
    if (!formData.project || !formData.task) return

    const newEntry: Partial<TimeEntry> = {
      project: formData.project,
      task: formData.task,
      description: formData.description,
      startTime: new Date(),
    }

    setCurrentEntry(newEntry)
    setIsTracking(true)
    setElapsedTime(0)
  }

  const stopTracking = () => {
    if (!currentEntry) return

    const endTime = new Date()
    const duration = endTime.getTime() - currentEntry.startTime!.getTime()

    const completedEntry: TimeEntry = {
      id: Date.now().toString(),
      project: currentEntry.project!,
      task: currentEntry.task!,
      description: currentEntry.description,
      startTime: currentEntry.startTime!,
      endTime,
      duration,
    }

    setTimeEntries([completedEntry, ...timeEntries])
    setCurrentEntry(null)
    setIsTracking(false)
    setElapsedTime(0)
    setFormData({ project: "", task: "", description: "" })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Time Tracking
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your time on projects and tasks
        </p>
      </div>

      {/* Current Timer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {isTracking ? "Currently Tracking" : "Start Time Tracking"}
          </CardTitle>
          <CardDescription>
            {isTracking
              ? "You're currently tracking time. Click stop when you're done."
              : "Fill in the details below to start tracking time."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isTracking ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Input
                    id="project"
                    name="project"
                    placeholder="Select or enter project name"
                    value={formData.project}
                    onChange={handleInputChange}
                    list="projects"
                  />
                  <datalist id="projects">
                    {projects.map((project) => (
                      <option key={project.id} value={project.name} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task">Task</Label>
                  <Input
                    id="task"
                    name="task"
                    placeholder="What are you working on?"
                    value={formData.task}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Add more details about your work"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <Button
                onClick={startTracking}
                disabled={!formData.project || !formData.task}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Tracking
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-4xl font-mono font-bold text-blue-600">
                {formatTime(elapsedTime)}
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {currentEntry?.project} - {currentEntry?.task}
                </p>
                {currentEntry?.description && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {currentEntry.description}
                  </p>
                )}
              </div>
              <Button onClick={stopTracking} variant="destructive" className="w-full">
                <Square className="h-4 w-4 mr-2" />
                Stop Tracking
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Time Entries
          </CardTitle>
          <CardDescription>
            Your recent time tracking sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timeEntries.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No time entries yet. Start tracking to see them here.
            </p>
          ) : (
            <div className="space-y-4">
              {timeEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{entry.project}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {entry.task}
                    </p>
                    {entry.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {entry.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-medium">
                      {formatTime(entry.duration || 0)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {entry.startTime.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

