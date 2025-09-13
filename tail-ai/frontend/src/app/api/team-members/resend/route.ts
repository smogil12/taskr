import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    // Get the email from the request body
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const backendUrl = `${BACKEND_URL}/api/team-members/resend`
    console.log('🔗 Resend route attempting to connect to:', backendUrl)
    console.log('🔗 BACKEND_URL is:', BACKEND_URL)
    console.log('🔗 Email:', email)

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error resending invitation:', error)
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    })
    return NextResponse.json({ 
      error: 'Failed to resend invitation',
      details: error.message,
      backendUrl: `${BACKEND_URL}/api/team-members/resend`
    }, { status: 500 })
  }
}
