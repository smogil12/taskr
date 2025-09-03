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
    address: "",
    notes: "",
    hourlyRate: ""
  })

  const [editClient, setEditClient] = useState({
    name: "",
    email: "",
    phone: "",
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
          company: "", // Company field removed from UI, set to empty string for backend
          hourlyRate: newClient.hourlyRate ? parseFloat(newClient.hourlyRate) : null
        })
      })

      if (response.ok) {
        await fetchClients()
        setNewClient({
          name: "",
          email: "",
          phone: "",
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
          company: "", // Company field removed from UI, set to empty string for backend
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
      {/* New Client Form */}
      {showNewClientForm && (
        <div className="compact-form bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 rounded-lg p-3">
          <div className="mb-3">
            <h1 className="text-base font-bold text-gray-900 dark:text-white">Add a new client to your portfolio</h1>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div className="border-b border-gray-900/10 pb-3 dark:border-white/10">
                <h2 className="text-xs font-semibold text-gray-900 dark:text-white">Client Information</h2>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Basic information about your client and their company.
                </p>

                                  <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label htmlFor="name" className="block text-xs font-medium text-gray-900 dark:text-white">
                        Client *
                      </label>
                      <div className="mt-1">
                        <input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Enter client name or company"
                          value={newClient.name}
                          onChange={handleInputChange}
                          required
                          className="block w-full rounded-md bg-white px-2 py-1 text-xs text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Enter the client's name or company name.</p>
                    </div>

                  <div className="sm:col-span-4">
                    <label htmlFor="email" className="block text-xs font-medium text-gray-900 dark:text-white">
                      Email address
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter email address"
                        value={newClient.email}
                        onChange={handleInputChange}
                        className="block w-full rounded-md bg-white px-2 py-1 text-xs text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="phone" className="block text-xs font-medium text-gray-900 dark:text-white">
                      Phone
                    </label>
                    <div className="mt-1">
                      <input
                        id="phone"
                        name="phone"
                        type="text"
                        placeholder="Enter phone number"
                        value={newClient.phone}
                        onChange={handleInputChange}
                        className="block w-full rounded-md bg-white px-2 py-1 text-xs text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label htmlFor="address" className="block text-xs font-medium text-gray-900 dark:text-white">
                      Address
                    </label>
                    <div className="mt-1">
                      <input
                        id="address"
                        name="address"
                        type="text"
                        placeholder="Enter address"
                        value={newClient.address}
                        onChange={handleInputChange}
                        className="block w-full rounded-md bg-white px-2 py-1 text-xs text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="hourlyRate" className="block text-xs font-medium text-gray-900 dark:text-white">
                      Hourly Rate ($)
                    </label>
                    <div className="mt-1">
                      <input
                        id="hourlyRate"
                        name="hourlyRate"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter hourly rate"
                        value={newClient.hourlyRate}
                        onChange={handleInputChange}
                        className="block w-full rounded-md bg-white px-2 py-1 text-xs text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-900/10 pb-3 dark:border-white/10">
                <h2 className="text-xs font-semibold text-gray-900 dark:text-white">Additional Information</h2>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Any additional notes or information about this client.
                </p>

                <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-6">
                  <div className="col-span-full">
                    <label htmlFor="notes" className="block text-xs font-medium text-gray-900 dark:text-white">
                      Notes
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        placeholder="Enter any additional notes"
                        value={newClient.notes}
                        onChange={handleInputChange}
                        className="block w-full rounded-md bg-white px-2 py-1 text-xs text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Add any relevant notes about this client.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button 
                type="button" 
                onClick={() => setShowNewClientForm(false)}
                className="text-xs font-semibold text-gray-900 dark:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:focus-visible:outline-indigo-500"
              >
                Create Client
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Client Form */}
      {showEditForm && (
        <div className="bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Edit Client</h1>
          </div>
          
          <form onSubmit={handleEdit}>
            <div className="space-y-8">
              <div className="border-b border-gray-900/10 pb-3 dark:border-white/10">
                <h2 className="text-xs font-semibold text-gray-900 dark:text-white">Client Information</h2>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Update your client's information.
                </p>

                <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label htmlFor="edit-name" className="block text-xs font-medium text-gray-900 dark:text-white">
                      Client *
                    </label>
                    <div className="mt-1">
                      <input
                        id="edit-name"
                        name="name"
                        type="text"
                        placeholder="Enter client name or company"
                        value={editClient.name}
                        onChange={handleEditInputChange}
                        required
                        className="block w-full rounded-md bg-white px-2 py-1 text-xs text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Enter the client's name or company name.</p>
                  </div>
                  <div className="sm:col-span-4">
                    <label htmlFor="edit-email" className="block text-xs font-medium text-gray-900 dark:text-white">
                      Email address
                    </label>
                    <div className="mt-1">
                      <input
                        id="edit-email"
                        name="email"
                        type="email"
                        placeholder="Enter email address"
                        value={editClient.email}
                        onChange={handleEditInputChange}
                        className="block w-full rounded-md bg-white px-2 py-1 text-xs text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="edit-phone" className="block text-xs font-medium text-gray-900 dark:text-white">
                      Phone
                    </label>
                    <div className="mt-1">
                      <input
                        id="edit-phone"
                        name="phone"
                        type="text"
                        placeholder="Enter phone number"
                        value={editClient.phone}
                        onChange={handleEditInputChange}
                        className="block w-full rounded-md bg-white px-2 py-1 text-xs text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label htmlFor="edit-address" className="block text-xs font-medium text-gray-900 dark:text-white">
                      Address
                    </label>
                    <div className="mt-1">
                      <input
                        id="edit-address"
                        name="address"
                        type="text"
                        placeholder="Enter address"
                        value={editClient.address}
                        onChange={handleEditInputChange}
                        className="block w-full rounded-md bg-white px-2 py-1 text-xs text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="edit-hourlyRate" className="block text-xs font-medium text-gray-900 dark:text-white">
                      Hourly Rate ($)
                    </label>
                    <div className="mt-1">
                      <input
                        id="edit-hourlyRate"
                        name="hourlyRate"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter hourly rate"
                        value={editClient.hourlyRate}
                        onChange={handleEditInputChange}
                        className="block w-full rounded-md bg-white px-2 py-1 text-xs text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-900/10 pb-3 dark:border-white/10">
                <h2 className="text-xs font-semibold text-gray-900 dark:text-white">Additional Information</h2>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Any additional notes or information about this client.
                </p>

                <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-6">
                  <div className="col-span-full">
                    <label htmlFor="edit-notes" className="block text-xs font-medium text-gray-900 dark:text-white">
                      Notes
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="edit-notes"
                        name="notes"
                        rows={3}
                        placeholder="Enter any additional notes"
                        value={editClient.notes}
                        onChange={handleEditInputChange}
                        className="block w-full rounded-md bg-white px-2 py-1 text-xs text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Add any relevant notes about this client.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button 
                type="button" 
                onClick={() => setShowEditForm(null)}
                className="text-xs font-semibold text-gray-900 dark:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:focus-visible:outline-indigo-500"
              >
                Update Client
              </button>
            </div>
          </form>
        </div>
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

      {/* Clients Table */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">Clients</h1>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              A list of all your clients including their contact information and project allocations.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button
              onClick={() => setShowNewClientForm(true)}
              className="block rounded-md bg-indigo-600 px-3 py-1.5 text-center text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add client
            </Button>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-1.5 align-middle sm:px-6 lg:px-8">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">Loading clients...</p>
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">No clients found. Create your first client to get started.</p>
                </div>
              ) : (
                <table className="relative min-w-full divide-y divide-gray-300 dark:divide-white/15">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pr-3 pl-4 text-left text-xs font-semibold text-gray-900 sm:pl-0 dark:text-white"
                      >
                        Client
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-white">
                        Contact
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-white">
                        Projects
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-white">
                        Hours
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-white">
                        Rate
                      </th>
                      <th scope="col" className="py-3.5 pr-4 pl-3 sm:pr-0">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                    {clients.map((client) => (
                      <tr key={client.id}>
                        <td className="py-4 pr-3 pl-4 text-xs font-medium whitespace-nowrap text-gray-900 sm:pl-0 dark:text-white">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-blue-600" />
                            {client.name}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          <div className="space-y-1">
                            {client.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="text-xs">{client.email}</span>
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span className="text-xs">{client.phone}</span>
                              </div>
                            )}
                            {!client.email && !client.phone && (
                              <span className="text-gray-400 text-xs">No contact info</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <FolderOpen className="h-3 w-3" />
                            {client.projects.length} project{client.projects.length !== 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getTotalAllocatedHours(client.projects)}h allocated
                          </div>
                          {getTotalConsumedHours(client.projects) > 0 && (
                            <div className="text-xs text-gray-400 mt-1">
                              {getTotalConsumedHours(client.projects)}h used
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {client.hourlyRate ? (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ${client.hourlyRate}/h
                            </div>
                          ) : (
                            <span className="text-gray-400">No rate set</span>
                          )}
                        </td>
                        <td className="py-4 pr-4 pl-3 text-right text-xs font-medium whitespace-nowrap sm:pr-0">
                          <div className="flex gap-2 justify-end">
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
