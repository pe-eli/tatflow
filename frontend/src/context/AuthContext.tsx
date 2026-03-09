import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (token: string, user: User, remember: boolean) => void
  logout: () => void
  updateUser: (partial: Partial<User>) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const getStorage = () => {
  return localStorage.getItem('tatflow_remember') === 'true' ? localStorage : sessionStorage
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check both storages on mount
    const ls = localStorage.getItem('tatflow_token')
    const lsUser = localStorage.getItem('tatflow_user')
    const ss = sessionStorage.getItem('tatflow_token')
    const ssUser = sessionStorage.getItem('tatflow_user')

    if (ls && lsUser) {
      setToken(ls)
      setUser(JSON.parse(lsUser))
    } else if (ss && ssUser) {
      setToken(ss)
      setUser(JSON.parse(ssUser))
    }
    setIsLoading(false)
  }, [])

  const login = (newToken: string, newUser: User, remember: boolean) => {
    setToken(newToken)
    setUser(newUser)

    // Clear both storages first
    localStorage.removeItem('tatflow_token')
    localStorage.removeItem('tatflow_user')
    sessionStorage.removeItem('tatflow_token')
    sessionStorage.removeItem('tatflow_user')

    const storage = remember ? localStorage : sessionStorage
    if (remember) {
      localStorage.setItem('tatflow_remember', 'true')
    } else {
      localStorage.removeItem('tatflow_remember')
    }
    storage.setItem('tatflow_token', newToken)
    storage.setItem('tatflow_user', JSON.stringify(newUser))
  }

  const updateUser = (partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...partial }
      const storage = getStorage()
      storage.setItem('tatflow_user', JSON.stringify(updated))
      return updated
    })
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('tatflow_token')
    localStorage.removeItem('tatflow_user')
    localStorage.removeItem('tatflow_remember')
    sessionStorage.removeItem('tatflow_token')
    sessionStorage.removeItem('tatflow_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
