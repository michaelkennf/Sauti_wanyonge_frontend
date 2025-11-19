"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut, Shield, FileText, Building, UserCheck } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { authService } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/hooks/use-translation"
import type { User as UserType } from "@/lib/auth"

export function Navbar() {
  const router = useRouter()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)

  // S'assurer que le composant est monté côté client avant d'accéder à localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        setUser(authService.getCurrentUser())
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error)
        setUser(null)
      }
    }
  }, [])

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    router.push("/")
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-16 hover:scale-105 transition-transform duration-200">
                  <Image src="/logo-sauti-ya-wayonge.png" alt="Sauti ya Wa Nyonge Logo" fill className="object-contain" />
                </div>
                <span className="hidden md:block text-xl font-semibold text-foreground">Sauti ya Wa Nyonge</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="relative overflow-hidden group">
                <span className="relative z-10">{t('nav.home')}</span>
                <div className="absolute inset-0 bg-primary/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              </Button>
            </Link>
            <Link href="/plainte">
              <Button variant="ghost" size="sm" className="relative overflow-hidden group">
                <span className="relative z-10">{t('nav.complaint')}</span>
                <div className="absolute inset-0 bg-primary/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              </Button>
            </Link>
            <Link href="/chatbot">
              <Button variant="ghost" size="sm" className="relative overflow-hidden group">
                <span className="relative z-10">{t('nav.chatbot')}</span>
                <div className="absolute inset-0 bg-primary/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              </Button>
            </Link>
            <Link href="/suivi">
              <Button variant="ghost" size="sm" className="relative overflow-hidden group">
                <span className="relative z-10">{t('nav.tracking')}</span>
                <div className="absolute inset-0 bg-primary/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" size="sm" className="relative overflow-hidden group">
                <span className="relative z-10">{t('nav.about')}</span>
                <div className="absolute inset-0 bg-primary/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" size="sm" className="relative overflow-hidden group">
                <span className="relative z-10">{t('nav.contact')}</span>
                <div className="absolute inset-0 bg-primary/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              </Button>
            </Link>
          </div>

          {/* User Menu & Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    {t('nav.profile')}
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuItem onClick={() => router.push("/admin/users")} className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        {t('nav.adminUsers')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/admin/dashboard")} className="cursor-pointer">
                        <Shield className="h-4 w-4 mr-2" />
                        {t('nav.adminDashboard')}
                      </DropdownMenuItem>
                    </>
                  )}
                  {user.role === "investigator" && (
                    <>
                      <DropdownMenuItem onClick={() => router.push("/enqueteur/formulaire")} className="cursor-pointer">
                        <FileText className="h-4 w-4 mr-2" />
                        {t('nav.investigatorForm')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/enqueteur/dashboard")} className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        {t('nav.investigatorDashboard')}
                      </DropdownMenuItem>
                    </>
                  )}
                  {user.role === "ngo" && (
                    <DropdownMenuItem onClick={() => router.push("/ngo/dashboard")} className="cursor-pointer">
                      <Building className="h-4 w-4 mr-2" />
                      {t('nav.ngoDashboard')}
                    </DropdownMenuItem>
                  )}
                  {user.role === "assurance" && (
                    <DropdownMenuItem onClick={() => router.push("/assurance/dashboard")} className="cursor-pointer">
                      <UserCheck className="h-4 w-4 mr-2" />
                      {t('nav.assuranceDashboard')}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login">
                <Button size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('nav.login')}</span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-border/40 animate-in slide-in-from-top-2 duration-300">
            <Link
              href="/"
              className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.home')}
            </Link>
            <Link
              href="/plainte"
              className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.complaint')}
            </Link>
            <Link
              href="/chatbot"
              className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.chatbot')}
            </Link>
            <Link
              href="/suivi"
              className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.tracking')}
            </Link>
            <Link
              href="/about"
              className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.about')}
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.contact')}
            </Link>
            {user && (
              <>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {t('nav.profile')}
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin/users"
                    className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('nav.adminUsers')}
                  </Link>
                )}
                <Button
                  size="sm"
                  className="block px-4 py-2 text-sm font-medium text-red-600 hover:bg-secondary rounded-md transition-colors"
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('nav.logout')}
                </Button>
              </>
            )}
            {!user && (
              <Link href="/auth/login">
                <Button
                  size="sm"
                  className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
                >
                  <User className="h-4 w-4 mr-2" />
                  {t('nav.login')}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
