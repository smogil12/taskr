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

function AcceptInviteContent() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<'loading' | 'form' | 'success' | 'error' | 'expired'>('loading')
  const [errorMessage, setErrorMessage] = useState("")
  const [inviteData, setInviteData] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [passwordValidation, setPasswordValidation] = useState<any>(null)
  const hasProcessed = useRef(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, signup } = useAuth()

  useEffect(() => {
    const inviteId = searchParams.get('invite')
    
    if (!inviteId) {
      setStatus('error')
      setErrorMessage('No invitation token provided')
      return
    }

    // Prevent multiple processing attempts
    if (hasProcessed.current) {
      return
    }

    const handleInvite = async () => {
      hasProcessed.current = true
      setIsProcessing(true)
      try {
        // Fetch invitation details
        const response = await fetch(`/api/team-members/invite/${inviteId}`)
        if (!response.ok) {
          if (response.status === 404) {
            setStatus('error')
            setErrorMessage('Invitation not found or has expired')
            return
          }
          throw new Error('Failed to fetch invitation')
        }
        
        const data = await response.json()
        setInviteData(data)
        setFormData(prev => ({ ...prev, email: data.email }))
        setStatus('form')
      } catch (err) {
        setStatus('error')
        setErrorMessage('Failed to load invitation')
      } finally {
        setIsProcessing(false)
      }
    }

    handleInvite()
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    }
    setFormData(newFormData)

    // Validate password in real-time
    if (e.target.name === 'password') {
      const validation = validatePassword(e.target.value)
      if (isCommonPassword(e.target.value)) {
        validation.errors.push('This password is too common. Please choose a more unique password.')
        validation.isValid = false
      }
      setPasswordValidation(validation)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Validate password before submission
    const validation = validatePassword(formData.password)
    if (isCommonPassword(formData.password)) {
      validation.errors.push('This password is too common. Please choose a more unique password.')
      validation.isValid = false
    }

    if (!validation.isValid) {
      setPasswordValidation(validation)
      setIsProcessing(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match')
      setIsProcessing(false)
      return
    }

    try {
      // Try to accept the invitation
      const response = await fetch(`/api/team-members/accept-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteId: searchParams.get('invite'),
          name: formData.name,
          password: formData.password
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to accept invitation')
      }

      const result = await response.json()
      
      // If user was created, log them in
      if (result.userCreated) {
        const loginSuccess = await login(formData.email, formData.password)
        if (loginSuccess) {
          setStatus('success')
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          setStatus('error')
          setErrorMessage('Account created but login failed. Please sign in manually.')
        }
      } else {
        // User already existed, just redirect to login
        setStatus('success')
        setTimeout(() => {
          router.push('/auth/signin?message=invitation-accepted')
        }, 2000)
      }
    } catch (err: any) {
      setStatus('error')
      setErrorMessage(err.message || 'Failed to accept invitation')
    } finally {
      setIsProcessing(false)
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900">
              <svg className="animate-spin h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Loading invitation...</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Please wait while we load your team invitation.
            </p>
          </div>
        )

      case 'form':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Join {inviteData?.inviterName}'s Team
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                You've been invited to join as a {inviteData?.role?.toLowerCase() || 'member'}
              </p>
            </div>

            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled
                className="mt-1 bg-gray-50 dark:bg-gray-800"
              />
              <p className="mt-1 text-xs text-gray-500">This email is pre-filled from your invitation</p>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1"
              />
              {passwordValidation && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${passwordValidation.score * 25}%`,
                          backgroundColor: getPasswordStrengthColor(passwordValidation.score)
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {getPasswordStrengthText(passwordValidation.score)}
                    </span>
                  </div>
                  {passwordValidation.errors.length > 0 && (
                    <ul className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {passwordValidation.errors.map((error: string, index: number) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            {errorMessage && (
              <div className="text-sm text-red-600 dark:text-red-400 text-center">
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isProcessing || !passwordValidation?.isValid}
            >
              {isProcessing ? 'Accepting Invitation...' : 'Accept Invitation & Create Account'}
            </Button>
          </form>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Invitation accepted!</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              You've successfully joined the team. Redirecting...
            </p>
          </div>
        )

      case 'error':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Invitation failed</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {errorMessage || 'The invitation link is invalid or has expired.'}
            </p>
            <div className="mt-4 space-y-2">
              <Button onClick={() => router.push('/auth/signin')} className="w-full">
                Back to Sign In
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Team Invitation</CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' && 'Loading your invitation...'}
            {status === 'form' && 'Complete your account setup'}
            {status === 'success' && 'Welcome to the team!'}
            {status === 'error' && 'Invitation failed'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AcceptInviteContent />
    </Suspense>
  )
}
