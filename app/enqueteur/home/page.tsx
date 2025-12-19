"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Fingerprint, FileText, BarChart3, LogOut } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function InvestigatorHomePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Vérifier que l'utilisateur est connecté et a vérifié son empreinte
    const isLoggedIn = localStorage.getItem('investigator_logged_in')
    const isFingerprintVerified = localStorage.getItem('investigator_fingerprint_verified')
    
    if (!isLoggedIn || !isFingerprintVerified) {
      router.push('/auth/investigator-login')
    }
  }, [router])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <Card className="w-full">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="relative h-16 w-16">
                <Image
                  src="/logo-sauti-ya-wayonge.png"
                  alt="Sauti ya wa nyonge"
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold">
              Documentation des cas
            </CardTitle>
            <CardDescription>
              Choisissez une action pour continuer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2"
                onClick={() => {
                  localStorage.removeItem('investigator_logged_in')
                  localStorage.removeItem('investigator_fingerprint_verified')
                  localStorage.removeItem('investigator_email')
                  router.push('/auth/investigator-login')
                }}
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/enqueteur/dashboard" className="block">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <BarChart3 className="h-12 w-12 text-primary" />
                        <div>
                          <h3 className="font-semibold text-lg">Tableau de bord</h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            Consultez vos enquêtes et statistiques
                          </p>
                        </div>
                        <Button className="w-full mt-4">
                          Accéder au tableau de bord
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>

              <Link href="/enqueteur/formulaire" className="block">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <FileText className="h-12 w-12 text-primary" />
                        <div>
                          <h3 className="font-semibold text-lg">Nouveau formulaire</h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            Créez une nouvelle enquête
                          </p>
                        </div>
                        <Button className="w-full mt-4">
                          Créer un formulaire
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

