"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { DashboardOverview } from "@/components/admin/dashboard-overview"
import { ComplaintsList } from "@/components/admin/complaints-list"
import { AIAnalytics } from "@/components/admin/ai-analytics"
import { UserManagement } from "@/components/admin/user-management"
import { ViolenceStatsManagement } from "@/components/admin/violence-stats-management"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { getCurrentUser } from "@/lib/auth-helpers"

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Vérifier l'authentification avec un petit délai pour laisser le temps au localStorage de se mettre à jour
    const checkAuth = () => {
      // Attendre un court instant pour s'assurer que localStorage est disponible
      setTimeout(() => {
        const user = getCurrentUser()
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
        
        // Debug en développement
        if (process.env.NODE_ENV === 'development') {
          console.log('Admin page - Auth check:', { 
            hasToken: !!token, 
            hasUser: !!user, 
            userRole: user?.role,
            tokenPreview: token?.substring(0, 20) + '...'
          })
        }
        
        if (!token || !user) {
          console.warn('Admin page - No token or user, redirecting to login')
          router.replace('/auth/login')
          return
        }

        // Vérifier que l'utilisateur est admin (tolérer différents formats)
        const role = (user.role || '').toUpperCase()
        const isAdmin = role === 'ADMIN'
        
        if (!isAdmin) {
          console.warn('Admin page - User is not admin, role:', role)
          router.replace('/')
          return
        }

        setIsAuthenticated(true)
        setIsChecking(false)
      }, 100)
    }

    checkAuth()
  }, [router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === "overview" && <DashboardOverview />}
            {activeTab === "users" && <UserManagement />}
            {activeTab === "complaints" && <ComplaintsList />}
            {activeTab === "analytics" && <AIAnalytics />}
            {activeTab === "violence-stats" && <ViolenceStatsManagement />}
          </div>
        </main>
      </div>
    </div>
  )
}
