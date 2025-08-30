"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, FolderOpen, ListTodo, TrendingUp, BarChart3, Calendar, Target, Zap } from "lucide-react"
import Link from "next/link"

export function Dashboard() {
  const { data: session } = useSession()

  // Mock data - will be replaced with real data from API
  const stats = [
    {
      title: "Active Projects",
      value: "5",
      description: "Projects in progress",
      icon: FolderOpen,
      href: "/projects",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Tasks Today",
      value: "12",
      description: "Tasks to complete",
      icon: ListTodo,
      href: "/tasks",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Hours This Week",
      value: "32.5",
      description: "Time tracked",
      icon: Clock,
      href: "/time-tracking",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Productivity",
      value: "87%",
      description: "Based on completion",
      icon: TrendingUp,
      href: "/analytics",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ]

  const recentProjects = [
    { id: 1, name: "Website Redesign", progress: 75, status: "In Progress", color: "bg-blue-500" },
    { id: 2, name: "Mobile App", progress: 45, status: "In Progress", color: "bg-green-500" },
    { id: 3, name: "Marketing Campaign", progress: 90, status: "Almost Done", color: "bg-purple-500" },
  ]

  const recentTasks = [
    { id: 1, title: "Review design mockups", project: "Website Redesign", due: "Today", priority: "high" },
    { id: 2, title: "Update API documentation", project: "Mobile App", due: "Tomorrow", priority: "medium" },
    { id: 3, title: "Finalize content", project: "Marketing Campaign", due: "This week", priority: "low" },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500"
      case "medium": return "bg-yellow-500"
      case "low": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {session?.user?.name || "User"}! 👋
          </h1>
          <p className="text-xl text-blue-100">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:scale-110 transition-transform duration-200">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Projects and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <Card className="border-0 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Recent Projects
            </CardTitle>
            <CardDescription>
              Your active projects and their progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {recentProjects.map((project) => (
              <div key={project.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">{project.name}</span>
                  <span className="text-sm text-muted-foreground">{project.status}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ease-out ${project.color}`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full group" asChild>
              <Link href="/projects" className="flex items-center gap-2">
                View All Projects
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card className="border-0 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-green-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <ListTodo className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              Recent Tasks
            </CardTitle>
            <CardDescription>
              Tasks that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTasks.map((task) => (
              <div key={task.id} className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                      <span className="font-medium text-gray-900 dark:text-white">{task.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{task.project}</p>
                  </div>
                  <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {task.due}
                  </span>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full group" asChild>
              <Link href="/tasks" className="flex items-center gap-2">
                View All Tasks
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            Quick Actions
          </CardTitle>
          <CardDescription>
            Get started quickly with common tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button asChild className="h-16 flex-col gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Link href="/time-tracking/start">
                <Clock className="h-5 w-5" />
                Start Time Tracking
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-16 flex-col gap-2 hover:bg-green-50 dark:hover:bg-green-900/10 hover:border-green-200 dark:hover:border-green-700">
              <Link href="/projects/new">
                <FolderOpen className="h-5 w-5" />
                Create Project
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-16 flex-col gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-200 dark:hover:border-purple-700">
              <Link href="/tasks/new">
                <ListTodo className="h-5 w-5" />
                Add Task
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Add missing ArrowRight icon component
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
)
