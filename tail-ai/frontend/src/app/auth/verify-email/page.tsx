"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import Link from "next/link"

function VerifyEmailContent() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying')
  const [errorMessage, setErrorMessage] = useState("")
  const hasVerified = useRef(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyEmail, error } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setVerificationStatus('error')
      setErrorMessage('No verification token provided')
      return
    }

    // Prevent multiple verification attempts
    if (hasVerified.current) {
      return
    }

    const handleVerification = async () => {
      hasVerified.current = true
      setIsVerifying(true)
      try {
        const success = await verifyEmail(token)
        if (success) {
          setVerificationStatus('success')
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
        } else {
          setVerificationStatus('error')
          setErrorMessage(error || 'Email verification failed')
        }
      } catch (err) {
        setVerificationStatus('error')
        setErrorMessage('An unexpected error occurred')
      } finally {
        setIsVerifying(false)
      }
    }

    handleVerification()
  }, [searchParams, verifyEmail, error, router])

  const renderContent = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900">
              <svg className="animate-spin h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Verifying your email...</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Please wait while we verify your email address.
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Email verified successfully!</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Your email has been verified. You will be redirected to the dashboard shortly.
            </p>
            <div className="mt-4">
              <Button onClick={() => router.push('/dashboard')} className="w-full">
                Go to Dashboard
              </Button>
            </div>
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
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Verification failed</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {errorMessage || 'The verification link is invalid or has expired.'}
            </p>
            <div className="mt-4 space-y-2">
              <Button onClick={() => router.push('/auth/signin')} className="w-full">
                Back to Sign In
              </Button>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Need a new verification email?{" "}
                <Link
                  href="/auth/signin"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Sign in to resend
                </Link>
              </p>
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
          <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            {verificationStatus === 'verifying' && 'Verifying your email address...'}
            {verificationStatus === 'success' && 'Verification complete!'}
            {verificationStatus === 'error' && 'Verification failed'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
