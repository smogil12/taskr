"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText, isCommonPassword } from "@/utils/passwordValidation"

export function SignUpForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState("")
  const [passwordValidation, setPasswordValidation] = useState<any>(null)
  const router = useRouter()
  const { signup, error } = useAuth()

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
    setIsLoading(true)

    // Validate password before submission
    const validation = validatePassword(formData.password)
    if (isCommonPassword(formData.password)) {
      validation.errors.push('This password is too common. Please choose a more unique password.')
      validation.isValid = false
    }

    if (!validation.isValid) {
      setPasswordValidation(validation)
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      // Handle password mismatch through the auth context
      setIsLoading(false)
      return
    }

    const result = await signup(formData.name, formData.email, formData.password)
    if (result.success) {
      if (result.needsVerification) {
        setVerificationMessage(result.message || "Please check your email to verify your account.")
        setShowVerificationMessage(true)
      } else {
        router.push("/dashboard")
      }
    }
    
    setIsLoading(false)
  }

  if (showVerificationMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Check your email</CardTitle>
            <CardDescription className="text-center">
              We&apos;ve sent you a verification link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Verification email sent</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {verificationMessage}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Didn&apos;t receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => {
                      // TODO: Implement resend functionality
                      console.log('Resend verification email')
                    }}
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    resend verification email
                  </button>
                </p>
              </div>
              <div className="text-center">
                <Link
                  href="/auth/signin"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Create your account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to get started with Taskr
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {passwordValidation && formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Password strength:</span>
                    <span className={`text-sm font-medium ${getPasswordStrengthColor(passwordValidation.strength)}`}>
                      {getPasswordStrengthText(passwordValidation.strength)}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordValidation.strength === 'weak' ? 'bg-red-500 w-1/4' :
                          passwordValidation.strength === 'medium' ? 'bg-yellow-500 w-1/2' :
                          passwordValidation.strength === 'strong' ? 'bg-blue-500 w-3/4' :
                          'bg-green-500 w-full'
                        }`}
                      />
                    </div>
                  </div>
                  {passwordValidation.errors.length > 0 && (
                    <ul className="text-sm text-red-600 space-y-1">
                      {passwordValidation.errors.map((error: string, index: number) => (
                        <li key={index} className="flex items-center space-x-1">
                          <span>•</span>
                          <span>{error}</span>
                        </li>
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
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

