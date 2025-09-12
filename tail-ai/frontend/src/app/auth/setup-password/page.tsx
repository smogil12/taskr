"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/providers/auth-provider"
import Link from "next/link"
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText, isCommonPassword } from "@/utils/passwordValidation"

function SetupPasswordContent() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'setup' | 'success' | 'error' | 'expired'>('setup')
  const [errorMessage, setErrorMessage] = useState("")
  const [passwordValidation, setPasswordValidation] = useState<any>(null)
  const hasProcessed = useRef(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (!token || !email) {
      setStatus('error')
      setErrorMessage('Invalid invitation link. Please contact the person who invited you.')
      return
    }
  }, [token, email])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)

    // Validate password in real-time
    const validation = validatePassword(newPassword)
    if (isCommonPassword(newPassword)) {
      validation.errors.push('This password is too common. Please choose a more unique password.')
      validation.isValid = false
    }
    setPasswordValidation(validation)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (hasProcessed.current) {
      return
    }

    // Validate password
    const validation = validatePassword(password)
    if (isCommonPassword(password)) {
      validation.errors.push('This password is too common. Please choose a more unique password.')
      validation.isValid = false
    }

    if (!validation.isValid) {
      setPasswordValidation(validation)
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match')
      return
    }

    hasProcessed.current = true
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          token,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        // Store the token and user data
        localStorage.setItem('taskr_token', data.token)
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setStatus('error')
        setErrorMessage(data.error || 'Failed to set password')
      }
    } catch (error) {
      setStatus('error')
      setErrorMessage('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'setup':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Set Your Password</CardTitle>
              <CardDescription className="text-center">
                You've been invited to join a team! Please set your password to complete your account setup.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter your password"
                    required
                  />
                  {passwordValidation && (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="h-2 w-full bg-gray-200 rounded-full overflow-hidden"
                        >
                          <div 
                            className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordValidation.score)}`}
                            style={{ width: `${(passwordValidation.score / 4) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {getPasswordStrengthText(passwordValidation.score)}
                        </span>
                      </div>
                      {passwordValidation.errors.length > 0 && (
                        <ul className="text-sm text-red-600 space-y-1">
                          {passwordValidation.errors.map((error: string, index: number) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                {errorMessage && (
                  <div className="text-red-600 text-sm text-center">
                    {errorMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !password || !confirmPassword}
                >
                  {isLoading ? 'Setting up...' : 'Complete Setup'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )

      case 'success':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-green-600">
                ✓ Account Setup Complete!
              </CardTitle>
              <CardDescription className="text-center">
                Your password has been set successfully. You'll be redirected to the dashboard shortly.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">
                Redirecting to dashboard...
              </p>
            </CardContent>
          </Card>
        )

      case 'error':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-red-600">
                Setup Failed
              </CardTitle>
              <CardDescription className="text-center">
                {errorMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/auth/signin">
                <Button variant="outline">
                  Go to Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Taskr</h1>
        </div>
        {renderContent()}
      </div>
    </div>
  )
}

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SetupPasswordContent />
    </Suspense>
  )
}
