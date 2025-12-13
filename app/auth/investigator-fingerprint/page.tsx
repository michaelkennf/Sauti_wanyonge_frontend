"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Fingerprint, Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"

export default function InvestigatorFingerprintPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isScanning, setIsScanning] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    // Vérifier que l'utilisateur est connecté
    const isLoggedIn = localStorage.getItem('investigator_logged_in')
    if (!isLoggedIn) {
      router.push('/auth/investigator-login')
    }
  }, [router])

  const handleFingerprintScan = async () => {
    setIsScanning(true)
    
    try {
      // Simulation du scan d'empreinte
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simuler la vérification biométrique
      const success = Math.random() > 0.1 // 90% de succès
      
      if (success) {
        setIsVerified(true)
        localStorage.setItem('investigator_fingerprint_verified', 'true')
        
        toast({
          title: "Empreinte vérifiée",
          description: "Votre identité a été confirmée avec succès",
        })
        
        // Rediriger vers la page d'accueil de l'enquêteur après un court délai
        setTimeout(() => {
          router.push('/enqueteur/home')
        }, 1500)
      } else {
        toast({
          title: "Échec de la vérification",
          description: "L'empreinte digitale n'a pas été reconnue. Veuillez réessayer.",
          variant: "destructive"
        })
        setIsScanning(false)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du scan",
        variant: "destructive"
      })
      setIsScanning(false)
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
              Vérification biométrique
            </CardTitle>
            <CardDescription>
              Scannez votre empreinte digitale pour continuer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isVerified ? (
              <>
                <div className="flex justify-center">
                  <motion.div
                    animate={isScanning ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1, repeat: isScanning ? Infinity : 0 }}
                    className="relative"
                  >
                    <Fingerprint className={`h-24 w-24 ${isScanning ? 'text-primary' : 'text-muted-foreground'}`} />
                  </motion.div>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Placez votre doigt sur le capteur biométrique pour vérifier votre identité
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleFingerprintScan} 
                  className="w-full" 
                  size="lg"
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scan en cours...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="mr-2 h-4 w-4" />
                      Scanner l'empreinte
                    </>
                  )}
                </Button>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-100 p-4">
                    <Fingerprint className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <p className="text-lg font-semibold text-green-600">
                  Empreinte vérifiée avec succès !
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirection en cours...
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

