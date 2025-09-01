"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Building2, Mail, Phone, DollarSign, Edit, Trash2, Eye, FolderOpen, Clock } from "lucide-react"

interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  address?: string
  notes?: string
  hourlyRate?: number
  projects: Project[]
}

interface Project {
  id: string
  name: string
  status: string
  allocatedHours: number
  consumedHours: number
  remainingHours: number
}

export function Clients() {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    notes: "",
    hourlyRate: ""
  })

  const [editClient, setEditClient] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    notes: "",
    hourlyRate: ""
  })

  // Fetch clients from API
  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/clients', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('taskr_token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewClient(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditClient(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('taskr_token')}`
        },
        body: JSON.stringify({
          ...newClient,
          hourlyRate: newClient.hourlyRate ? parseFloat(newClient.hourlyRate) : null
        })
      })

      if (response.ok) {
        await fetchClients()
        setNewClient({
          name: "",
          email: "",
          phone: "",
          company: "",
          address: "",
          notes: "",
          hourlyRate: ""
        })
        setShowNewClientForm(false)
      }
    } catch (error) {
      console.error('Error creating client:', error)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showEditForm) return

    try {
      const response = await fetch(`/api/clients/${showEditForm}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('taskr_token')}`
        },
        body: JSON.stringify({
          ...editClient,
          hourlyRate: editClient.hourlyRate ? parseFloat(editClient.hourlyRate) : null
        })
      })

      if (response.ok) {
        await fetchClients()
        setShowEditForm(null)
        setEditClient({
          name: "",
          email: "",
          phone: "",
          company: "",
          address: "",
          notes: "",
          hourlyRate: ""
        })
      }
    } catch (error) {
      console.error('Error updating client:', error)
    }
  }

  const handleDelete = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('taskr_token')}`
        }
      })

      if (response.ok) {
        await fetchClients()
      }
    } catch (error) {
      console.error('Error deleting client:', error)
    }
  }

  const openEditForm = (client: Client) => {
    setEditClient({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || "",
      address: client.address || "",
      notes: client.notes || "",
      hourlyRate: client.hourlyRate?.toString() || ""
    })
    setShowEditForm(client.id)
  }

  const openClientDetail = (client: Client) => {
    setSelectedClient(client)
  }

  const closeClientDetail = () => {
    setSelectedClient(null)
  }

  const getTotalAllocatedHours = (projects: Project[]) => {
    return projects.reduce((total, project) => total + project.allocatedHours, 0)
  }

  const getTotalConsumedHours = (projects: Project[]) => {
    return projects.reduce((total, project) => total + project.consumedHours, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Clients
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your client relationships and project allocations
          </p>
        </div>
        <Button onClick={() => setShowNewClientForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Client
        </Button>
      </div>

      {/* New Client Form */}
      {showNewClientForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Client</CardTitle>
            <CardDescription>
              Add a new client to your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Client Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter client name"
                    value={newClient.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Enter company name"
                    value={newClient.company}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={newClient.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number"
                    value={newClient.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Enter address"
                  value={newClient.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    name="hourlyRate"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter hourly rate"
                    value={newClient.hourlyRate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="Enter any additional notes"
                  value={newClient.notes}
                  onChange={handleInputChange}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Client</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewClientForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Edit Client Form */}
      {showEditForm && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Client</CardTitle>
            <CardDescription>
              Update client information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Client Name *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    placeholder="Enter client name"
                    value={editClient.name}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-company">Company</Label>
                  <Input
                    id="edit-company"
                    name="company"
                    placeholder="Enter company name"
                    value={editClient.company}
                    onChange={handleEditInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={editClient.email}
                    onChange={handleEditInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    name="phone"
                    placeholder="Enter phone number"
                    value={editClient.phone}
                    onChange={handleEditInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  name="address"
                  placeholder="Enter address"
                  value={editClient.address}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="edit-hourlyRate"
                    name="hourlyRate"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter hourly rate"
                    value={editClient.hourlyRate}
                    onChange={handleEditInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <textarea
                  id="edit-notes"
                  name="notes"
                  placeholder="Enter any additional notes"
                  value={editClient.notes}
                  onChange={handleEditInputChange}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Update Client</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditForm(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{selectedClient.name}</CardTitle>
                  <CardDescription>
                    {selectedClient.company && `${selectedClient.company} • `}
                    Client Details & Project Summary
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={closeClientDetail}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Client Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  {selectedClient.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{selectedClient.email}</span>
                    </div>
                  )}
                  {selectedClient.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{selectedClient.phone}</span>
                    </div>
                  )}
                  {selectedClient.address && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span>{selectedClient.address}</span>
                    </div>
                  )}
                  {selectedClient.hourlyRate && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>${selectedClient.hourlyRate}/hour</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Project Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedClient.projects.length}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Total Projects</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg dark:bg-green-900/20">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {getTotalAllocatedHours(selectedClient.projects)}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">Allocated Hours</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Projects List */}
              {selectedClient.projects.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Projects</h3>
                  <div className="space-y-3">
                    {selectedClient.projects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FolderOpen className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium">{project.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Status: {project.status}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-medium">{project.allocatedHours}h</div>
                            <div className="text-gray-500">Allocated</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{project.consumedHours}h</div>
                            <div className="text-gray-500">Used</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{project.remainingHours}h</div>
                            <div className="text-gray-500">Remaining</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedClient.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Notes</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedClient.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {clients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openClientDetail(client)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditForm(client)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(client.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {client.company && `${client.company} • `}
                {client.projects.length} project{client.projects.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {client.projects.length} projects
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {getTotalAllocatedHours(client.projects)}h allocated
                  </span>
                </div>
              </div>

              {client.hourlyRate && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    ${client.hourlyRate}/hour
                  </span>
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={() => openClientDetail(client)}>
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="text-gray-600 dark:text-gray-400">Loading clients...</div>
        </div>
      )}

      {!isLoading && clients.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-600 dark:text-gray-400">No clients found. Create your first client to get started.</div>
        </div>
      )}
    </div>
  )
}
