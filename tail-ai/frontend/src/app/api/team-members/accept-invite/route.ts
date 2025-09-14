import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { inviteId, name, password } = body

    if (!inviteId || !name || !password) {
      return NextResponse.json({ error: 'Invite ID, name, and password are required' }, { status: 400 })
    }

    const backendUrl = `${BACKEND_URL}/api/team-members/accept-invite`
    console.log('🔗 Frontend API accepting invitation via backend:', backendUrl)

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inviteId, name, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Frontend API Error accepting invitation:', error)
    return NextResponse.json({ 
      error: 'Failed to accept invitation from frontend API',
      details: error.message,
      backendUrl: `${BACKEND_URL}/api/team-members/accept-invite`
    }, { status: 500 })
  }
}



