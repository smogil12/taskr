import { NextRequest, NextResponse } from 'next/server'

// Mock data for testing - replace with actual API calls to backend
const mockClients = [
  {
    id: "1",
    name: "Acme Corp",
    email: "contact@acmecorp.com",
    phone: "+1-555-0123",
    company: "Acme Corporation",
    address: "123 Business St, City, State 12345",
    notes: "Long-term client with multiple projects",
    hourlyRate: 85,
    projects: [
      {
        id: "1",
        name: "Website Redesign",
        status: "IN_PROGRESS",
        allocatedHours: 120,
        consumedHours: 90,
        remainingHours: 30
      }
    ]
  },
  {
    id: "2",
    name: "TechStart Inc",
    email: "hello@techstart.com",
    phone: "+1-555-0456",
    company: "TechStart Inc",
    address: "456 Innovation Ave, Tech City, TC 67890",
    notes: "Startup company, budget-conscious",
    hourlyRate: 75,
    projects: [
      {
        id: "2",
        name: "Mobile App Development",
        status: "PLANNING",
        allocatedHours: 200,
        consumedHours: 50,
        remainingHours: 150
      }
    ]
  },
  {
    id: "3",
    name: "Growth Marketing",
    email: "info@growthmarketing.com",
    phone: "+1-555-0789",
    company: "Growth Marketing LLC",
    address: "789 Marketing Blvd, Growth City, GC 11111",
    notes: "Marketing agency, regular projects",
    hourlyRate: 90,
    projects: [
      {
        id: "3",
        name: "Marketing Campaign",
        status: "REVIEW",
        allocatedHours: 80,
        consumedHours: 72,
        remainingHours: 8
      }
    ]
  }
]

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      )
    }

    // Find and update client
    const clientIndex = mockClients.findIndex(client => client.id === id)
    if (clientIndex === -1) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    const updatedClient = {
      ...mockClients[clientIndex],
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      company: body.company || null,
      address: body.address || null,
      notes: body.notes || null,
      hourlyRate: body.hourlyRate || null
    }

    mockClients[clientIndex] = updatedClient

    return NextResponse.json(updatedClient)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Find and delete client
    const clientIndex = mockClients.findIndex(client => client.id === id)
    if (clientIndex === -1) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Check if client has projects
    const client = mockClients[clientIndex]
    if (client.projects && client.projects.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete client with existing projects. Please reassign or delete projects first.' },
        { status: 400 }
      )
    }

    mockClients.splice(clientIndex, 1)

    return NextResponse.json({ message: 'Client deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    )
  }
}
