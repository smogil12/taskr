import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('range') || 'month' // week, month, quarter, year

    // Fetch all tasks
    const tasksResponse = await fetch(`${API_BASE_URL}/api/tasks`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!tasksResponse.ok) {
      throw new Error(`Failed to fetch tasks: ${tasksResponse.status}`)
    }

    const tasksData = await tasksResponse.json()
    const tasks = tasksData.tasks || []

    // Calculate date ranges based on timeRange
    const now = new Date()
    let startDate: Date
    let intervals: { label: string; start: Date; end: Date }[] = []

    switch (timeRange) {
      case 'week':
        // Last 7 days
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 6)
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(now.getDate() - i)
          const label = date.toLocaleDateString('en-US', { weekday: 'short' })
          const start = new Date(date.setHours(0, 0, 0, 0))
          const end = new Date(date.setHours(23, 59, 59, 999))
          intervals.push({ label, start, end })
        }
        break

      case 'quarter':
        // Last 90 days grouped by weeks
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 89)
        for (let i = 12; i >= 0; i--) {
          const weekStart = new Date(now)
          weekStart.setDate(now.getDate() - (i * 7))
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          
          const label = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
          intervals.push({ 
            label, 
            start: new Date(weekStart.setHours(0, 0, 0, 0)), 
            end: new Date(weekEnd.setHours(23, 59, 59, 999)) 
          })
        }
        break

      case 'year':
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
          const label = monthDate.toLocaleDateString('en-US', { month: 'short' })
          intervals.push({ 
            label, 
            start: new Date(monthDate.setHours(0, 0, 0, 0)), 
            end: new Date(monthEnd.setHours(23, 59, 59, 999)) 
          })
        }
        break

      case 'month':
      default:
        // Last 30 days grouped by weeks
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 29)
        for (let i = 4; i >= 0; i--) {
          const weekStart = new Date(now)
          weekStart.setDate(now.getDate() - (i * 6))
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 5)
          
          const label = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
          intervals.push({ 
            label, 
            start: new Date(weekStart.setHours(0, 0, 0, 0)), 
            end: new Date(weekEnd.setHours(23, 59, 59, 999)) 
          })
        }
        break
    }

    // Count completed and created tasks per interval
    const historyData = intervals.map(interval => {
      const completedTasks = tasks.filter((task: any) => {
        if (task.status !== 'COMPLETED') return false
        
        // Use updatedAt or lastEditedAt as completion date
        const completionDate = task.lastEditedAt ? new Date(task.lastEditedAt) : new Date(task.updatedAt)
        
        return completionDate >= interval.start && completionDate <= interval.end
      }).length

      const createdTasks = tasks.filter((task: any) => {
        const creationDate = new Date(task.createdAt)
        return creationDate >= interval.start && creationDate <= interval.end
      }).length

      return {
        month: interval.label,
        tasks: completedTasks,
        createdTasks: createdTasks
      }
    })

    console.log('📊 Tasks history data:', historyData)
    console.log('📊 Time range:', timeRange)
    console.log('📊 Total tasks:', tasks.length)

    return NextResponse.json({
      tasksHistory: historyData,
      timeRange,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t: any) => t.status === 'COMPLETED').length
    })

  } catch (error) {
    console.error('Error fetching tasks history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks history' },
      { status: 500 }
    )
  }
}

