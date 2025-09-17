import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('🔍 FRONTEND DEBUG: Team invitation request received')
    console.log('🔍 Invite ID:', id)
    console.log('🔍 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
    console.log('🔍 BACKEND_URL constant:', BACKEND_URL)

    const backendUrl = `${BACKEND_URL}/api/team-members/invite/${id}`
    console.log('🔗 Frontend API fetching invitation from backend:', backendUrl)

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
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
    console.error('❌ Frontend API Error fetching invitation:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch invitation from frontend API',
      details: error.message,
      backendUrl: `${BACKEND_URL}/api/team-members/invite/${params.id}`
    }, { status: 500 })
  }
}



