import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Get all clients for the authenticated user
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const clients = await prisma.client.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            allocatedHours: true,
            consumedHours: true,
            remainingHours: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    res.status(500).json({ error: 'Failed to fetch clients' })
  }
})

// Get a specific client by ID
router.get('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params
    
    const client = await prisma.client.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        projects: {
          include: {
            tasks: {
              select: {
                id: true,
                title: true,
                status: true,
                estimatedHours: true,
                actualHours: true
              }
            }
          }
        }
      }
    })

    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }

    res.json(client)
  } catch (error) {
    console.error('Error fetching client:', error)
    res.status(500).json({ error: 'Failed to fetch client' })
  }
})

// Create a new client
router.post('/', authenticateToken, async (req: any, res: any) => {
  try {
    const { name, email, phone, company, address, notes, hourlyRate } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Client name is required' })
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        company,
        address,
        notes,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        userId: req.user.id
      }
    })

    res.status(201).json(client)
  } catch (error) {
    console.error('Error creating client:', error)
    res.status(500).json({ error: 'Failed to create client' })
  }
})

// Update a client
router.put('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params
    const { name, email, phone, company, address, notes, hourlyRate } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Client name is required' })
    }

    // Verify the client belongs to the user
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    })

    if (!existingClient) {
      return res.status(404).json({ error: 'Client not found' })
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        company,
        address,
        notes,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null
      }
    })

    res.json(updatedClient)
  } catch (error) {
    console.error('Error updating client:', error)
    res.status(500).json({ error: 'Failed to update client' })
  }
})

// Delete a client
router.delete('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params

    // Verify the client belongs to the user
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    })

    if (!existingClient) {
      return res.status(404).json({ error: 'Client not found' })
    }

    // Check if client has projects
    const projectsCount = await prisma.project.count({
      where: { clientId: id }
    })

    if (projectsCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete client with existing projects. Please reassign or delete projects first.' 
      })
    }

    await prisma.client.delete({
      where: { id }
    })

    res.json({ message: 'Client deleted successfully' })
  } catch (error) {
    console.error('Error deleting client:', error)
    res.status(500).json({ error: 'Failed to delete client' })
  }
})

// Get client's projects
router.get('/:id/projects', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params

    // Verify the client belongs to the user
    const client = await prisma.client.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    })

    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }

    const projects = await prisma.project.findMany({
      where: { clientId: id },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            estimatedHours: true,
            actualHours: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(projects)
  } catch (error) {
    console.error('Error fetching client projects:', error)
    res.status(500).json({ error: 'Failed to fetch client projects' })
  }
})

export default router
