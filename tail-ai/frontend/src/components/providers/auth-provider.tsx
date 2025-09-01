"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  subscriptionTier: string
  subscriptionEnds?: string
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
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  error: string | null
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/profile`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/signin`, {
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

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setError(null)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('taskr_token', data.token)
        return true
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Signup failed')
        return false
      }
    } catch (error) {
      setError('An error occurred during signup')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('taskr_token')
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    signup,
    logout,
    isLoading,
    error,
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

