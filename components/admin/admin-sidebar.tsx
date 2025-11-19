"use client"

import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, BarChart3, Users, LogOut, X } from "lucide-react"
import Link from "next/link"

type AdminSidebarProps = {
  activeTab: string
  setActiveTab: (tab: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function AdminSidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: AdminSidebarProps) {
  const menuItems = [
    { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: "users", label: "Gestion des utilisateurs", icon: Users },
    { id: "complaints", label: "Plaintes", icon: FileText },
    { id: "analytics", label: "Analyse IA", icon: BarChart3 },
  ]

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Admin Panel</h2>
                <p className="text-sm text-muted-foreground">Sauti ya Wa Nyonge</p>
              </div>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className="w-full justify-start gap-3"
                onClick={() => {
                  setActiveTab(item.id)
                  setIsOpen(false)
                }}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button asChild variant="outline" className="w-full gap-2 bg-transparent">
              <Link href="/">
                <LogOut className="h-4 w-4" />
                Retour au site
              </Link>
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
