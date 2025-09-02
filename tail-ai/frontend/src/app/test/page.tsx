"use client"

import { useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestPage() {
  const { user, token, login, signup, logout } = useAuth()
  const [testResult, setTestResult] = useState<string>("")

  const testAuth = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setTestResult(`✅ Auth working! User: ${data.user.name}`)
      } else {
        setTestResult(`❌ Auth failed: ${response.status}`)
      }
    } catch (error) {
      setTestResult(`❌ Auth error: ${error}`)
    }
  }

  const testProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setTestResult(`✅ Projects API working! Found ${data.projects?.length || 0} projects`)
      } else {
        setTestResult(`❌ Projects API failed: ${response.status}`)
      }
    } catch (error) {
      setTestResult(`❌ Projects API error: ${error}`)
    }
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">API Test Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
          <CardDescription>Current user and token status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>User:</strong> {user ? user.name : 'Not logged in'}
          </div>
          <div>
            <strong>Token:</strong> {token ? 'Present' : 'Not present'}
          </div>
          <div>
            <strong>Email:</strong> {user ? user.email : 'N/A'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Tests</CardTitle>
          <CardDescription>Test various API endpoints</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={testAuth}>Test Auth API</Button>
            <Button onClick={testProjects}>Test Projects API</Button>
          </div>
          {testResult && (
            <div className="p-4 bg-gray-100 rounded">
              <strong>Result:</strong> {testResult}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Test authentication flow</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={() => signup("Test User", "test2@example.com", "password123")}
            >
              Test Signup
            </Button>
            <Button 
              onClick={() => login("test@example.com", "password123")}
            >
              Test Login
            </Button>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
