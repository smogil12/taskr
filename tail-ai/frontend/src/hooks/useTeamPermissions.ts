import { useState, useEffect } from 'react'

interface TeamPermissions {
  canAccessTeamMembers: boolean
  canManageMembers: boolean
  isTeamOwner: boolean
}

export function useTeamPermissions() {
  const [permissions, setPermissions] = useState<TeamPermissions>({
    canAccessTeamMembers: true, // Default to true for optimistic rendering
    canManageMembers: true,
    isTeamOwner: true
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem('taskr_token')
        if (!token) {
          setPermissions({
            canAccessTeamMembers: false,
            canManageMembers: false,
            isTeamOwner: false
          })
          setIsLoading(false)
          return
        }

        const response = await fetch('/api/team-members/permissions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setPermissions({
            canAccessTeamMembers: data.canAccessTeamMembers || false,
            canManageMembers: data.canManageMembers || false,
            isTeamOwner: data.isTeamOwner || false
          })
        } else {
          setPermissions({
            canAccessTeamMembers: false,
            canManageMembers: false,
            isTeamOwner: false
          })
        }
      } catch (error) {
        console.error('Error fetching team permissions:', error)
        setPermissions({
          canAccessTeamMembers: false,
          canManageMembers: false,
          isTeamOwner: false
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPermissions()
  }, [])

  return { permissions, isLoading }
}
