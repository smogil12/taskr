import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/calendar?error=no_code`);
    }

    // Forward the OAuth callback to the backend
    const backendCallbackUrl = `${BACKEND_URL}/api/calendar/oauth/callback?code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ''}`;
    
    const response = await fetch(backendCallbackUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Backend OAuth callback error:', response.status, await response.text());
      return NextResponse.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/calendar?error=oauth_failed`);
    }

    // The backend will handle the token exchange and redirect back to the frontend
    // Since we're proxying, we need to handle the redirect ourselves
    return NextResponse.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/calendar?connected=true`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/calendar?error=callback_failed`);
  }
}
