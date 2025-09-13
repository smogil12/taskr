"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Users, Mail, Shield, Edit, Trash2, UserPlus, Clock } from "lucide-react"

interface TeamMember {
  id: string
  email: string
  role: 'ADMIN' | 'MEMBER'
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  invitedAt: string
  user?: {
    id: string
    name: string
    email: string
    isEmailVerified: boolean
  }
}

export function TeamMembers() {
  const { user } = useAuth()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [newMember, setNewMember] = useState({
    email: "",
    role: "MEMBER" as 'ADMIN' | 'MEMBER'
  })

  const [editMember, setEditMember] = useState({
    role: "MEMBER" as 'ADMIN' | 'MEMBER'
  })

  // Fetch team members from API
  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/team-members', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('taskr_token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setTeamMembers(data)
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewMember(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditMember(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/team-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('taskr_token')}`
        },
        body: JSON.stringify(newMember)
      })

      if (response.ok) {
        await fetchTeamMembers()
        setNewMember({
          email: "",
          role: "MEMBER"
        })
        setShowInviteForm(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to invite team member')
      }
    } catch (error) {
      console.error('Error inviting team member:', error)
      alert('Failed to invite team member')
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showEditForm) return

    try {
      const response = await fetch(`/api/team-members/${showEditForm}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('taskr_token')}`
        },
        body: JSON.stringify(editMember)
      })

      if (response.ok) {
        await fetchTeamMembers()
        setShowEditForm(null)
        setEditMember({
          role: "MEMBER"
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update team member')
      }
    } catch (error) {
      console.error('Error updating team member:', error)
      alert('Failed to update team member')
    }
  }

  const handleDelete = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return

    try {
      const response = await fetch(`/api/team-members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('taskr_token')}`
        }
      })

      if (response.ok) {
        await fetchTeamMembers()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to remove team member')
      }
    } catch (error) {
      console.error('Error removing team member:', error)
      alert('Failed to remove team member')
    }
  }

  const handleResendInvite = async (memberId: string, email: string) => {
    try {
      const response = await fetch(`/api/team-members/${memberId}/resend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('taskr_token')}`
        }
      })

      if (response.ok) {
        alert(`Invitation resent to ${email}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to resend invitation')
      }
    } catch (error) {
      console.error('Error resending invitation:', error)
      alert('Failed to resend invitation')
    }
  }

  const openEditForm = (member: TeamMember) => {
    setEditMember({
      role: member.role
    })
    setShowEditForm(member.id)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
      case 'ACCEPTED':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      case 'DECLINED':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20'
      case 'MEMBER':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Invite Team Member Form Modal */}
      {showInviteForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && setShowInviteForm(false)}
        >
          <div className="bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 rounded-lg p-6 w-full max-w-md">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Invite Team Member</h1>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          
            <form onSubmit={handleInvite}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-white">
                    Email Address *
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter email address"
                      value={newMember.email}
                      onChange={handleInputChange}
                      required
                      className="block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    They will receive an invitation to join your team.
                  </p>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-900 dark:text-white">
                    Role
                  </label>
                  <div className="mt-1">
                    <select
                      id="role"
                      name="role"
                      value={newMember.role}
                      onChange={handleInputChange}
                      className="block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-indigo-500"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Members can view and manage projects. Admins have full access.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-x-6">
                <button 
                  type="button" 
                  onClick={() => setShowInviteForm(false)}
                  className="text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Member Form Modal */}
      {showEditForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && setShowEditForm(null)}
        >
          <div className="bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 rounded-lg p-6 w-full max-w-md">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Update Role</h1>
              <button
                type="button"
                onClick={() => setShowEditForm(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          
            <form onSubmit={handleEdit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-role" className="block text-sm font-medium text-gray-900 dark:text-white">
                    Role
                  </label>
                  <div className="mt-1">
                    <select
                      id="edit-role"
                      name="role"
                      value={editMember.role}
                      onChange={handleEditInputChange}
                      className="block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-indigo-500"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Members can view and manage projects. Admins have full access.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-x-6">
                <button 
                  type="button" 
                  onClick={() => setShowEditForm(null)}
                  className="text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                >
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Members Table */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">Team Members</h1>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Manage your team members and their access levels.
            </p>
          </div>
          <div className="mt-6 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => setShowInviteForm(true)}
              className="rounded-full bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500 flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Invite Member
            </button>
          </div>
        </div>
        <div className="mt-16 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-1.5 align-middle sm:px-6 lg:px-8">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">Loading team members...</p>
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No team members</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by inviting your first team member.
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowInviteForm(true)}
                      className="rounded-full bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500 flex items-center gap-2 mx-auto"
                    >
                      <UserPlus className="h-4 w-4" />
                      Invite Member
                    </button>
                  </div>
                </div>
              ) : (
                <table className="relative min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-white/5">
                      <th
                        scope="col"
                        className="py-3.5 pr-3 pl-4 text-left text-xs font-semibold text-gray-900 sm:pl-0 dark:text-white"
                      >
                        Member
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-white">
                        Role
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-white">
                        Invited
                      </th>
                      <th scope="col" className="py-3.5 pr-4 pl-3 sm:pr-0">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150">
                        <td className="py-8 pr-3 pl-4 text-xs font-medium whitespace-nowrap text-gray-900 sm:pl-0 dark:text-white">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <Users className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {member.user?.name || member.email}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-8 text-sm whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                            <Shield className="h-3 w-3 mr-1" />
                            {member.role}
                          </span>
                        </td>
                        <td className="px-3 py-8 text-sm whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="px-3 py-8 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(member.invitedAt)}
                          </div>
                        </td>
                        <td className="py-8 pr-4 pl-3 text-right text-xs font-medium whitespace-nowrap sm:pr-0">
                          <div className="flex gap-2 justify-end">
                            {member.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => handleResendInvite(member.id, member.email)}
                                className="rounded-full bg-yellow-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-yellow-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600 dark:bg-yellow-500 dark:shadow-none dark:hover:bg-yellow-400 dark:focus-visible:outline-yellow-500 flex items-center gap-1"
                              >
                                <Mail className="h-3 w-3" />
                                Resend
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => openEditForm(member)}
                              className="rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500 flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(member.id)}
                              className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:bg-red-500 dark:shadow-none dark:hover:bg-red-400 dark:focus-visible:outline-red-500 flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
