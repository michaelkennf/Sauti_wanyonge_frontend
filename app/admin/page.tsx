"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { DashboardOverview } from "@/components/admin/dashboard-overview"
import { ComplaintsList } from "@/components/admin/complaints-list"
import { AIAnalytics } from "@/components/admin/ai-analytics"
import { UserManagement } from "@/components/admin/user-management"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
          </div>
        </main>
      </div>
    </div>
  )
}
