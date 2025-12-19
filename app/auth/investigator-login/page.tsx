"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Mail, Loader2, AlertCircle, ArrowLeft, Home } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function InvestigatorLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulation de connexion avec vérification des identifiants
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Vérifier que c'est bien un compte enquêteur
      if (!formData.email.includes('investigator') && !formData.email.includes('enqueteur')) {
        setError("Ce compte n'est pas un compte enquêteur")
        setIsLoading(false)
        return
      }
      
      // Sauvegarder les informations de connexion
      localStorage.setItem('investigator_logged_in', 'true')
      localStorage.setItem('investigator_email', formData.email)
      
      // Rediriger vers la page de scan d'empreinte
      router.push('/auth/investigator-fingerprint')
    } catch (error) {
      setError("Email ou mot de passe incorrect")
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
              Connexion Enquêteur
            </CardTitle>
            <CardDescription>
              Connectez-vous avec vos identifiants enquêteur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Link href="/auth/login-select" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Link>
              <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                <Home className="h-4 w-4 mr-2" />
                Accueil
              </Link>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="enqueteur@example.com"
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

