import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Team member tasks API called')
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      console.log('❌ No token provided')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('✅ Token found, proceeding with API calls')

    // Fetch current user profile to get their ID
    const userResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!userResponse.ok) {
      throw new Error(`Failed to fetch user profile: ${userResponse.status}`)
    }

    const userData = await userResponse.json()
    const currentUserId = userData.user?.id
    console.log('🔍 Current user ID:', currentUserId)

    // Fetch team members
    const teamMembersResponse = await fetch(`${API_BASE_URL}/api/team-members`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!teamMembersResponse.ok) {
      throw new Error(`Failed to fetch team members: ${teamMembersResponse.status}`)
    }

    const teamMembersData = await teamMembersResponse.json()
    const teamMembers = teamMembersData.teamMembers || []

    console.log('🔍 Raw team members data:', JSON.stringify(teamMembersData, null, 2))
    console.log('🔍 Team members array:', teamMembers)

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

    // Debug logging
    console.log('Team members:', teamMembers.map(m => ({ id: m.user?.id || m.id, name: m.user?.name || m.email, role: m.role })))
    console.log('Tasks:', tasks.map(t => ({ id: t.id, title: t.title, assignedTo: t.assignedTo, createdBy: t.createdBy })))

    // Define colors for team members
    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#F97316', // Orange
      '#EC4899', // Pink
      '#6366F1', // Indigo
    ]

    // Count tasks per team member
    const taskCounts = new Map<string, number>()
    
    // Initialize all team members with 0 tasks
    teamMembers.forEach((member: any) => {
      const userId = member.user?.id || member.id
      taskCounts.set(userId, 0)
    })

    // Count tasks for each team member
    tasks.forEach((task: any) => {
      // Count tasks assigned to team members
      if (task.assignedTo) {
        const currentCount = taskCounts.get(task.assignedTo) || 0
        taskCounts.set(task.assignedTo, currentCount + 1)
      }
      
      // Also count tasks created by team members (if they're not assigned to anyone)
      if (task.createdBy && !task.assignedTo) {
        const currentCount = taskCounts.get(task.createdBy) || 0
        taskCounts.set(task.createdBy, currentCount + 1)
      }
    })

    // Debug logging for task counts
    console.log('Task counts:', Object.fromEntries(taskCounts))

    // Create the data array for the pie chart
    const chartData = teamMembers
      .map((member: any, index: number) => {
        const userId = member.user?.id || member.id
        const taskCount = taskCounts.get(userId) || 0
        const name = member.user?.name || member.email || 'Unknown'
        
        console.log(`Member ${name} (${userId}): ${taskCount} tasks`)
        
        return {
          name,
          tasks: taskCount,
          color: colors[index % colors.length],
          userId,
          email: member.user?.email || member.email,
          role: member.role || 'MEMBER'
        }
      })
      .filter(member => member.tasks > 0) // Only show team members with tasks
      .sort((a, b) => b.tasks - a.tasks) // Sort by task count descending

    // Debug: Check if account owner is missing and add them if needed
    const accountOwnerId = currentUserId // Use dynamic current user ID
    const accountOwnerTasks = taskCounts.get(accountOwnerId) || 0
    
    if (accountOwnerTasks > 0) {
      const accountOwnerInChart = chartData.find(member => member.userId === accountOwnerId)
      if (!accountOwnerInChart) {
        console.log(`🔍 Adding missing account owner with ${accountOwnerTasks} tasks`)
        // Add the account owner to the chart data
        chartData.unshift({
          name: userData.user?.name || 'Account Owner',
          tasks: accountOwnerTasks,
          color: colors[0], // Use first color
          userId: accountOwnerId,
          email: userData.user?.email || 'Unknown',
          role: 'OWNER'
        })
      }
    }

    console.log('Final chart data:', chartData)

    return NextResponse.json({
      teamMemberTasks: chartData,
      totalTasks: tasks.length,
      totalTeamMembers: teamMembers.length,
      teamMembersWithTasks: chartData.length
    })

  } catch (error) {
    console.error('Error fetching team member task data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team member task data' },
      { status: 500 }
    )
  }
}
