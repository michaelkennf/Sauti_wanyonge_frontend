"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Mail, Loader2, AlertCircle, Home } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { apiService } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // Récupérer le token CSRF au chargement de la page
  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
        await fetch(`${API_URL}/csrf-token`, {
          method: 'GET',
          credentials: 'include',
        })
      } catch (error) {
        console.warn('Erreur lors de la récupération du token CSRF:', error)
      }
    }

    fetchCSRFToken()
  }, [])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Utiliser l'API réelle pour la connexion
      const response = await apiService.login({
        email: formData.email,
        password: formData.password
      })

      // Vérifier que les données sont bien stockées
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('auth_token')
        const storedUser = localStorage.getItem('user')
        
        if (!storedToken || !storedUser) {
          console.error('Login - Token or user not stored in localStorage')
          setError('Erreur lors de la connexion. Veuillez réessayer.')
          setIsLoading(false)
          return
        }
      }
      
      // Attendre un court instant pour s'assurer que localStorage est mis à jour
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Redirection basée sur le rôle de l'utilisateur (normaliser en majuscules)
      const role = (response.user.role || '').toUpperCase()
      
      if (role === 'ADMIN') {
        // Utiliser replace pour éviter de pouvoir revenir en arrière vers la page de login
        router.replace('/admin')
      } else if (role === 'INVESTIGATOR') {
        // Pour l'enquêteur, rediriger vers la page biométrique
        router.replace('/auth/biometric-verification')
      } else if (role === 'NGO') {
        router.replace('/ngo/dashboard')
      } else if (role === 'ASSURANCE') {
        router.replace('/assurance/dashboard')
      } else {
        // Par défaut, rediriger vers le profil utilisateur
        router.replace('/profile')
      }
    } catch (error: any) {
      console.error('Erreur de connexion:', error)
      setError(error.message || "Email ou mot de passe incorrect")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="w-full">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-4"
              >
                <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="relative h-16 w-16">
                    <Image
                      src="/logo-sauti-ya-wayonge.png"
                      alt="Sauti ya wa nyonge"
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  </div>
                </Link>
              </motion.div>
              <CardTitle className="text-2xl font-bold">
                Connexion
              </CardTitle>
              <CardDescription>
                Connectez-vous pour accéder à votre espace de travail
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                <Home className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Link>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </form>
            </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}