"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Fingerprint, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  UserCheck,
  Lock,
  Unlock
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

interface BiometricManagerProps {
  investigatorId: string
  onBiometricComplete: (isRegistered: boolean) => void
  onBiometricVerified: (isVerified: boolean) => void
}

interface BiometricStatus {
  isRegistered: boolean
  isVerified: boolean
  registrationAttempts: number
  verificationAttempts: number
  lastRegistration?: string
  lastVerification?: string
}

export function BiometricManager({ 
  investigatorId, 
  onBiometricComplete, 
  onBiometricVerified 
}: BiometricManagerProps) {
  const { toast } = useToast()
  const [status, setStatus] = useState<BiometricStatus>({
    isRegistered: false,
    isVerified: false,
    registrationAttempts: 0,
    verificationAttempts: 0
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentAction, setCurrentAction] = useState<'none' | 'register' | 'verify'>('none')
  const [progress, setProgress] = useState(0)

  // Vérifier le statut biométrique au chargement
  useEffect(() => {
    checkBiometricStatus()
  }, [investigatorId])

  const checkBiometricStatus = async () => {
    try {
      // Simulation de vérification du statut
      const savedStatus = localStorage.getItem(`biometric_${investigatorId}`)
      if (savedStatus) {
        const parsedStatus = JSON.parse(savedStatus)
        setStatus(parsedStatus)
        onBiometricComplete(parsedStatus.isRegistered)
        onBiometricVerified(parsedStatus.isVerified)
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut biométrique:', error)
    }
  }

  const simulateBiometricCapture = async (action: 'register' | 'verify') => {
    setIsProcessing(true)
    setCurrentAction(action)
    setProgress(0)

    // Simulation du processus de capture
    const steps = [
      { progress: 20, message: "Initialisation du capteur..." },
      { progress: 40, message: "Positionnement du doigt..." },
      { progress: 60, message: "Capture en cours..." },
      { progress: 80, message: "Traitement des données..." },
      { progress: 100, message: "Finalisation..." }
    ]

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setProgress(step.progress)
    }

    // Simulation du résultat
    const success = Math.random() > 0.1 // 90% de succès

    if (action === 'register') {
      if (success) {
        const newStatus = {
          ...status,
          isRegistered: true,
          registrationAttempts: status.registrationAttempts + 1,
          lastRegistration: new Date().toISOString()
        }
        setStatus(newStatus)
        localStorage.setItem(`biometric_${investigatorId}`, JSON.stringify(newStatus))
        
        toast({
          title: "Enregistrement réussi",
          description: "Vos empreintes digitales ont été enregistrées avec succès",
        })
        
        onBiometricComplete(true)
      } else {
        setStatus({
          ...status,
          registrationAttempts: status.registrationAttempts + 1
        })
        
        toast({
          title: "Échec de l'enregistrement",
          description: "Veuillez réessayer. Assurez-vous que votre doigt est propre et bien positionné.",
          variant: "destructive"
        })
      }
    } else if (action === 'verify') {
      if (success) {
        const newStatus = {
          ...status,
          isVerified: true,
          verificationAttempts: status.verificationAttempts + 1,
          lastVerification: new Date().toISOString()
        }
        setStatus(newStatus)
        localStorage.setItem(`biometric_${investigatorId}`, JSON.stringify(newStatus))
        
        toast({
          title: "Vérification réussie",
          description: "Identité confirmée. Accès autorisé.",
        })
        
        onBiometricVerified(true)
      } else {
        setStatus({
          ...status,
          verificationAttempts: status.verificationAttempts + 1
        })
        
        toast({
          title: "Échec de la vérification",
          description: "Empreintes non reconnues. Veuillez réessayer.",
          variant: "destructive"
        })
      }
    }

    setIsProcessing(false)
    setCurrentAction('none')
    setProgress(0)
  }

  const handleRegister = () => {
    simulateBiometricCapture('register')
  }

  const handleVerify = () => {
    simulateBiometricCapture('verify')
  }

  const resetBiometric = () => {
    const newStatus = {
      isRegistered: false,
      isVerified: false,
      registrationAttempts: 0,
      verificationAttempts: 0
    }
    setStatus(newStatus)
    localStorage.removeItem(`biometric_${investigatorId}`)
    onBiometricComplete(false)
    onBiometricVerified(false)
    
    toast({
      title: "Biométrie réinitialisée",
      description: "Vous devrez réenregistrer vos empreintes lors du prochain accès.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Statut actuel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Statut Biométrique
          </CardTitle>
          <CardDescription>
            Gestion de l'authentification par empreintes digitales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Fingerprint className="h-4 w-4" />
                <span className="text-sm font-medium">Enregistrement</span>
              </div>
              <Badge variant={status.isRegistered ? "default" : "secondary"}>
                {status.isRegistered ? "Enregistré" : "Non enregistré"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                <span className="text-sm font-medium">Vérification</span>
              </div>
              <Badge variant={status.isVerified ? "default" : "secondary"}>
                {status.isVerified ? "Vérifié" : "Non vérifié"}
              </Badge>
            </div>
          </div>

          {status.isRegistered && (
            <div className="text-xs text-muted-foreground">
              <p>Dernier enregistrement: {status.lastRegistration ? new Date(status.lastRegistration).toLocaleString() : 'N/A'}</p>
              <p>Tentatives d'enregistrement: {status.registrationAttempts}</p>
              <p>Tentatives de vérification: {status.verificationAttempts}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Biométriques</CardTitle>
          <CardDescription>
            {!status.isRegistered 
              ? "Première connexion : Enregistrez vos empreintes digitales"
              : "Vérifiez votre identité pour accéder au formulaire"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!status.isRegistered ? (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Premier accès détecté</strong><br />
                  Vous devez enregistrer vos empreintes digitales pour sécuriser votre accès au formulaire d'enquête.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleRegister}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement en cours...
                  </>
                ) : (
                  <>
                    <Fingerprint className="h-4 w-4 mr-2" />
                    Enregistrer mes empreintes
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <strong>Empreintes enregistrées</strong><br />
                  Vérifiez votre identité pour accéder au formulaire d'enquête.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleVerify}
                disabled={isProcessing || status.isVerified}
                className="w-full"
                size="lg"
                variant={status.isVerified ? "outline" : "default"}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Vérification en cours...
                  </>
                ) : status.isVerified ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Identité vérifiée
                  </>
                ) : (
                  <>
                    <Fingerprint className="h-4 w-4 mr-2" />
                    Vérifier mon identité
                  </>
                )}
              </Button>

              {status.isVerified && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <Badge variant="default" className="mb-2">
                    <Unlock className="h-3 w-3 mr-1" />
                    Accès autorisé
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Vous pouvez maintenant accéder au formulaire d'enquête
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {/* Barre de progression */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div className="flex justify-between text-sm">
                  <span>
                    {currentAction === 'register' ? 'Enregistrement' : 'Vérification'} en cours
                  </span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bouton de réinitialisation (pour les tests) */}
          {status.isRegistered && (
            <div className="pt-4 border-t">
              <Button 
                onClick={resetBiometric}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Lock className="h-4 w-4 mr-2" />
                Réinitialiser la biométrie
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
