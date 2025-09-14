import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const { id } = params

    const backendUrl = `${BACKEND_URL}/api/team-members/${id}`
    console.log('🔗 Frontend API removing team member via backend:', backendUrl)

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Frontend API Error removing team member:', error)
    return NextResponse.json({ 
      error: 'Failed to remove team member from frontend API',
      details: error.message,
      backendUrl: `${BACKEND_URL}/api/team-members/${params.id}`
    }, { status: 500 })
  }
}