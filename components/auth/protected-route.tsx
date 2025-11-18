"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService, type User } from "@/lib/auth"
import { Spinner } from "@/components/ui/spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: User["role"][]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = authService.isAuthenticated()
      const user = authService.getCurrentUser()

      if (!isAuthenticated || !user) {
        router.push("/auth/login")
        return
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push("/")
        return
      }

      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router, allowedRoles])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  return isAuthorized ? <>{children}</> : null
}
