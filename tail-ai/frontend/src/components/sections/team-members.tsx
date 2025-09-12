"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Users, Mail, UserPlus, Trash2, Edit, RefreshCw } from "lucide-react"
import { PermissionChecker, UserRole, Permission, getRoleDisplayName, getRoleDescription } from "@/utils/permissions"

interface TeamMember {
  id: string
  email: string
  name?: string
  role: string
  status: string
  invitedAt: string
  joinedAt?: string
  user?: {
    id: string
    name: string
    email: string
  }
}

export function TeamMembers() {
  const { user, token } = useAuth()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>(UserRole.MEMBER)
  const [inviteData, setInviteData] = useState({
    email: "",
    name: "",
    role: "MEMBER"
  })

  // Fetch team members and determine user role when component mounts
  useEffect(() => {
    if (token) {
      fetchTeamMembers()
      determineUserRole()
    }
  }, [token])

  const determineUserRole = async () => {
    if (!token) return
    
    try {
      // For now, assume the current user is the OWNER since they can access the app
      // In a real implementation, this would come from the backend
      setUserRole(UserRole.OWNER)
    } catch (error) {
      console.error('Error determining user role:', error)
      setUserRole(UserRole.MEMBER)
    }
  }

  const fetchTeamMembers = async () => {
    if (!token) return
    
    try {
      setIsLoading(true)
      const response = await fetch('/api/team-members', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTeamMembers(data.teamMembers || [])
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    try {
      const response = await fetch('/api/team-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(inviteData)
      })

      if (response.ok) {
        await fetchTeamMembers()
        setInviteData({ email: "", name: "", role: "MEMBER" })
        setShowInviteForm(false)
      } else {
        const error = await response.json()
        console.error('Error inviting team member:', error)
      }
    } catch (error) {
      console.error('Error inviting team member:', error)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!token) return

    try {
      const response = await fetch(`/api/team-members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchTeamMembers()
      }
    } catch (error) {
      console.error('Error removing team member:', error)
    }
  }

  const handleResendVerification = async (memberId: string) => {
    if (!token) return

    try {
      const response = await fetch(`/api/team-members/${memberId}/resend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Team invitation email resent:', data.message)
        alert('Team invitation email sent successfully!')
      } else {
        const error = await response.json()
        console.error('Error resending team invitation:', error)
        alert('Failed to resend team invitation email. Please try again.')
      }
    } catch (error) {
      console.error('Error resending team invitation:', error)
      alert('Failed to resend team invitation email. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "DECLINED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "ADMIN":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "MEMBER":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  if (!token) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Team Members
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Please sign in to view and manage your team members.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Invite Form */}
      {showInviteForm && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Team Member</CardTitle>
            <CardDescription>
              Invite a new team member to collaborate on your projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  placeholder="team.member@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">Name (Optional)</Label>
                <Input
                  id="name"
                  type="text"
                  value={inviteData.name}
                  onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                  placeholder="Team Member Name"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Send Invitation</Button>
                <Button type="button" variant="outline" onClick={() => setShowInviteForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Manage your team members and their roles.
              </CardDescription>
            </div>
            {PermissionChecker.hasPermission(userRole, Permission.INVITE_TEAM_MEMBERS) && (
              <Button onClick={() => setShowInviteForm(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">Loading team members...</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No team members yet</p>
              {PermissionChecker.hasPermission(userRole, Permission.INVITE_TEAM_MEMBERS) && (
                <Button onClick={() => setShowInviteForm(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Your First Team Member
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {member.user?.name || member.name || 'Unknown'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                          {member.role}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                          {member.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {member.user?.email || member.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Invited {new Date(member.invitedAt).toLocaleDateString()}
                        {member.joinedAt && ` • Joined ${new Date(member.joinedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.status === 'PENDING' && PermissionChecker.hasPermission(userRole, Permission.INVITE_TEAM_MEMBERS) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResendVerification(member.id)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Resend team invitation email"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    {PermissionChecker.hasPermission(userRole, Permission.REMOVE_TEAM_MEMBERS) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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
