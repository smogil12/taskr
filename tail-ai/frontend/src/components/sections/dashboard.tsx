"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, FolderOpen, ListTodo, TrendingUp, BarChart3, Calendar, Target, Zap, Building2, Users } from "lucide-react"
import Link from "next/link"

export function Dashboard() {
  const { user } = useAuth()
  const [clients, setClients] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch data from API
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const [clientsResponse, projectsResponse] = await Promise.all([
        fetch('/api/clients', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('taskr_token')}`
          }
        }),
        fetch('/api/projects', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('taskr_token')}`
          }
        })
      ])

      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json()
        setClients(clientsData)
      }

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setProjects(projectsData.projects || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate dashboard statistics
  const totalClients = clients.length
  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'PLANNING').length
  const totalAllocatedHours = projects.reduce((sum, p) => sum + (p.allocatedHours || 0), 0)
  const totalConsumedHours = projects.reduce((sum, p) => sum + (p.consumedHours || 0), 0)
  const totalRemainingHours = projects.reduce((sum, p) => sum + (p.remainingHours || 0), 0)

  // Mock data - will be replaced with real data from API
  const stats = [
    {
      title: "Total Clients",
      value: totalClients.toString(),
      description: "Active clients",
      icon: Building2,
      href: "/clients",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Active Projects",
      value: activeProjects.toString(),
      description: "Projects in progress",
      icon: FolderOpen,
      href: "/projects",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Allocated Hours",
      value: totalAllocatedHours.toString(),
      description: "Total hours allocated",
      icon: Clock,
      href: "/projects",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Remaining Hours",
      value: totalRemainingHours.toString(),
      description: "Hours left to complete",
      icon: Target,
      href: "/projects",
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
            Welcome back, {user?.name || "User"}! 👋
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

      {/* Client Overview and Hour Consumption */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Client Overview */}
        <Card className="border-0 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Client Overview
            </CardTitle>
            <CardDescription>
              Your clients and their project allocations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {clients.slice(0, 3).map((client) => {
              const clientProjects = projects.filter(p => p.clientId === client.id)
              const totalAllocated = clientProjects.reduce((sum, p) => sum + (p.allocatedHours || 0), 0)
              const totalConsumed = clientProjects.reduce((sum, p) => sum + (p.consumedHours || 0), 0)
              const totalRemaining = clientProjects.reduce((sum, p) => sum + (p.remainingHours || 0), 0)
              
              return (
                <div key={client.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">{client.name}</span>
                    <span className="text-sm text-muted-foreground">{clientProjects.length} projects</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Hours</span>
                      <span className="font-medium">{totalConsumed}/{totalAllocated}h</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ease-out ${
                          totalConsumed / totalAllocated > 0.9 
                            ? 'bg-red-500' 
                            : totalConsumed / totalAllocated > 0.7 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((totalConsumed / totalAllocated) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      {totalRemaining}h remaining
                    </div>
                  </div>
                </div>
              )
            })}
            {clients.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No clients found. Create your first client to get started.
              </div>
            )}
            <Button variant="outline" className="w-full group" asChild>
              <Link href="/clients" className="flex items-center gap-2">
                View All Clients
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Hour Consumption Chart */}
        <Card className="border-0 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-green-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              Hour Consumption
            </CardTitle>
            <CardDescription>
              Track your project hours and allocations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Hours Summary */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {totalAllocatedHours}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Allocated</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg dark:bg-green-900/20">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {totalConsumedHours}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">Consumed</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg dark:bg-orange-900/20">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {totalRemainingHours}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">Remaining</div>
              </div>
            </div>

            {/* Hours Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">
                  {totalAllocatedHours > 0 
                    ? Math.round((totalConsumedHours / totalAllocatedHours) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-green-500 to-blue-500"
                  style={{ 
                    width: `${totalAllocatedHours > 0 
                      ? Math.min((totalConsumedHours / totalAllocatedHours) * 100, 100)
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Top Projects by Hours */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-900 dark:text-white">Top Projects by Hours</h4>
              {projects
                .filter(p => p.allocatedHours > 0)
                .sort((a, b) => (b.allocatedHours || 0) - (a.allocatedHours || 0))
                .slice(0, 3)
                .map((project) => (
                  <div key={project.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground truncate">{project.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{project.consumedHours || 0}h</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-muted-foreground">{project.allocatedHours}h</span>
                    </div>
                  </div>
                ))}
            </div>

            <Button variant="outline" className="w-full group" asChild>
              <Link href="/projects" className="flex items-center gap-2">
                View All Projects
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild className="h-16 flex-col gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Link href="/projects">
                <FolderOpen className="h-5 w-5" />
                Manage Projects
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-16 flex-col gap-2 hover:bg-green-50 dark:hover:bg-green-900/10 hover:border-green-200 dark:hover:border-green-700">
              <Link href="/projects/new">
                <FolderOpen className="h-5 w-5" />
                Create Project
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-16 flex-col gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-200 dark:hover:border-purple-700">
              <Link href="/clients/new">
                <Building2 className="h-5 w-5" />
                Add Client
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-16 flex-col gap-2 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:border-orange-200 dark:hover:border-orange-700">
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
