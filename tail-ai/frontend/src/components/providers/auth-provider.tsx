"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  subscriptionTier: string
  subscriptionEnds?: string
  isEmailVerified?: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    projects: number
    tasks: number
    timeEntries: number
  }
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; needsVerification?: boolean; message?: string }>
  logout: () => void
  signOut: () => void
  isLoading: boolean
  error: string | null
  verifyEmail: (token: string) => Promise<boolean>
  resendVerification: (email: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('taskr_token')
    if (storedToken) {
      setToken(storedToken)
      fetchUserProfile(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('taskr_token')
        setToken(null)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      localStorage.removeItem('taskr_token')
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null)
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('taskr_token', data.token)
        return true
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Login failed')
        return false
      }
    } catch (error) {
      setError('An error occurred during login')
      return false
    }
  }

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; needsVerification?: boolean; message?: string }> => {
    try {
      setError(null)
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        // Don't set token or user for unverified accounts
        if (data.user.isEmailVerified) {
          setToken(data.token)
          setUser(data.user)
          localStorage.setItem('taskr_token', data.token)
          return { success: true }
        } else {
          return { 
            success: true, 
            needsVerification: true, 
            message: data.message || 'Please check your email to verify your account.' 
          }
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Signup failed')
        return { success: false, message: errorData.error || 'Signup failed' }
      }
    } catch (error) {
      setError('An error occurred during signup')
      return { success: false, message: 'An error occurred during signup' }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('taskr_token')
  }

  const verifyEmail = async (token: string): Promise<boolean> => {
    try {
      setError(null)
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        if (data.token) {
          setToken(data.token)
          localStorage.setItem('taskr_token', data.token)
        }
        return true
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Email verification failed')
        return false
      }
    } catch (error) {
      setError('An error occurred during email verification')
      return false
    }
  }

  const resendVerification = async (email: string): Promise<boolean> => {
    try {
      setError(null)
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        return true
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to resend verification email')
        return false
      }
    } catch (error) {
      setError('An error occurred while resending verification email')
      return false
    }
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    signup,
    logout,
    signOut: logout,
    isLoading,
    error,
    verifyEmail,
    resendVerification,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

