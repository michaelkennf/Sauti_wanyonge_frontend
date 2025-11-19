"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Fingerprint, Shield, Loader2, AlertCircle, CheckCircle, XCircle, Key, Eye, EyeOff, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"

export default function BiometricVerificationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [biometricSupported, setBiometricSupported] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'registering' | 'verifying' | 'success' | 'failed'>('idle')
  const [showPasswordOption, setShowPasswordOption] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [bypassMode, setBypassMode] = useState(false)

  // Vérifier le support biométrique au chargement
  useEffect(() => {
    if (typeof window !== "undefined") {
      const supported = window.PublicKeyCredential !== undefined &&
        typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function"
      setBiometricSupported(supported)
      
      // Simuler la vérification si c'est la première fois
      // En réalité, cela viendrait de l'API après la connexion
      const isFirstTimeUser = !localStorage.getItem('investigator_biometric_registered')
      setIsFirstTime(isFirstTimeUser)
    }
  }, [])

  const handleBiometricRegistration = async () => {
    if (!biometricSupported) {
      setError("Authentification biométrique non supportée sur cet appareil")
      return
    }

    setIsLoading(true)
    setVerificationStatus('registering')
    setError("")

    try {
      // Simulation de l'enregistrement biométrique WebAuthn
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "Sauti ya Wa Nyonge" },
          user: {
            id: new Uint8Array(16),
            name: "investigator",
            displayName: "Enquêteur",
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
        },
      })

      // Simuler l'enregistrement réussi
      localStorage.setItem('investigator_biometric_registered', 'true')
      localStorage.setItem('investigator_biometric_credential', JSON.stringify({
        id: 'simulated_credential_id',
        type: 'public-key'
      }))
      
      setVerificationStatus('success')
      
      // Redirection vers le formulaire après 2 secondes
      setTimeout(() => {
        router.push("/enqueteur/formulaire")
      }, 2000)

    } catch (err) {
      setError("Échec de l'enregistrement biométrique")
      setVerificationStatus('failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBiometricVerification = async () => {
    if (!biometricSupported) {
      setError("Authentification biométrique non supportée sur cet appareil")
      return
    }

    setIsLoading(true)
    setVerificationStatus('verifying')
    setError("")

    try {
      // Vérifier si l'utilisateur est enregistré
      const isRegistered = localStorage.getItem('investigator_biometric_registered')
      if (!isRegistered) {
        setError("Aucune empreinte digitale enregistrée. Veuillez d'abord vous enregistrer.")
        setVerificationStatus('failed')
        return
      }

      // Simulation de la vérification biométrique WebAuthn
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [{
            id: new Uint8Array(16),
            type: 'public-key',
          }],
          userVerification: "required",
        },
      })

      setVerificationStatus('success')
      
      // Redirection vers le formulaire après 2 secondes
      setTimeout(() => {
        router.push("/enqueteur/formulaire")
      }, 2000)

    } catch (err) {
      setError("Échec de la vérification biométrique")
      setVerificationStatus('failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordVerification = async () => {
    if (!password.trim()) {
      setError("Veuillez saisir votre mot de passe")
      return
    }

    setIsLoading(true)
    setVerificationStatus('verifying')
    setError("")

    try {
      // Simulation de la vérification par mot de passe
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // En production, vérifier le mot de passe avec l'API
      // Pour la démo, accepter n'importe quel mot de passe non vide
      if (password.length >= 4) {
        setVerificationStatus('success')
        
        // Marquer comme authentifié par mot de passe
        localStorage.setItem('investigator_password_authenticated', 'true')
        
        // Redirection vers le formulaire après 2 secondes
        setTimeout(() => {
          router.push("/enqueteur/formulaire")
        }, 2000)
      } else {
        setError("Mot de passe trop court (minimum 4 caractères)")
        setVerificationStatus('failed')
      }
    } catch (err) {
      setError("Échec de la vérification par mot de passe")
      setVerificationStatus('failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBypassAccess = () => {
    setIsLoading(true)
    setVerificationStatus('verifying')
    setError("")

    // Simulation d'un délai pour le mode contournement
    setTimeout(() => {
      setVerificationStatus('success')
      
      // Marquer comme accès contourné
      localStorage.setItem('investigator_bypass_authenticated', 'true')
      
      // Redirection vers le formulaire après 2 secondes
      setTimeout(() => {
        router.push("/enqueteur/formulaire")
      }, 2000)
    }, 1000)
  }

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'registering':
      case 'verifying':
        return <Loader2 className="h-8 w-8 animate-spin text-primary" />
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />
      case 'failed':
        return <XCircle className="h-8 w-8 text-red-500" />
      default:
        return <Fingerprint className="h-8 w-8 text-primary" />
    }
  }

  const getStatusText = () => {
    switch (verificationStatus) {
      case 'registering':
        return "Enregistrement en cours..."
      case 'verifying':
        return "Vérification en cours..."
      case 'success':
        return isFirstTime ? "Enregistrement réussi !" : "Vérification réussie !"
      case 'failed':
        return "Échec de l'authentification"
      default:
        return isFirstTime ? "Enregistrement requis" : "Vérification requise"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="relative h-20 w-20">
                <Image
                  src="/logo-sauti-ya-wayonge.png"
                  alt="Sauti ya Wa Nyonge"
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                <Shield className="h-6 w-6" />
                {isFirstTime ? "Enregistrement Biométrique" : "Vérification Biométrique"}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                {isFirstTime 
                  ? "Enregistrez vos empreintes digitales pour sécuriser votre accès"
                  : "Vérifiez votre identité avec vos empreintes digitales"
                }
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Display */}
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center"
              >
                {getStatusIcon()}
              </motion.div>
              <p className="text-lg font-medium">{getStatusText()}</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Instructions */}
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                  💡 L'authentification biométrique est <strong>optionnelle</strong>
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                  Vous pouvez utiliser les options alternatives ci-dessous si vous préférez
                </p>
              </div>
              
              {biometricSupported && (
                <>
                  {isFirstTime ? (
                    <>
                      <p>• Placez votre doigt sur le capteur biométrique</p>
                      <p>• Maintenez jusqu'à ce que l'enregistrement soit terminé</p>
                      <p>• Vous devrez répéter cette opération plusieurs fois</p>
                    </>
                  ) : (
                    <>
                      <p>• Placez votre doigt enregistré sur le capteur</p>
                      <p>• Maintenez jusqu'à la reconnaissance</p>
                      <p>• Assurez-vous que votre doigt est propre et sec</p>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Options de contournement - Toujours disponibles */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <Key className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                <p className="text-sm font-medium">Options d'accès alternatives</p>
                <p className="text-xs text-muted-foreground">
                  {!biometricSupported 
                    ? "Votre appareil ne supporte pas l'authentification biométrique"
                    : "Utilisez ces options si vous préférez ne pas utiliser l'empreinte digitale"
                  }
                </p>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => setShowPasswordOption(!showPasswordOption)}
                  variant="outline"
                  className="w-full"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Utiliser le mot de passe de l'ordinateur
                </Button>
                
                <Button
                  onClick={() => setBypassMode(!bypassMode)}
                  variant="outline"
                  className="w-full"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Accès temporaire (désactiver la sécurité)
                </Button>
              </div>
            </div>

            {/* Formulaire de mot de passe */}
            {showPasswordOption && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe de l'ordinateur</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Saisissez votre mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handlePasswordVerification}
                    className="flex-1"
                    disabled={isLoading || !password.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Vérification...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-4 w-4" />
                        Vérifier le mot de passe
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => setShowPasswordOption(false)}
                    variant="outline"
                  >
                    Annuler
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Confirmation du mode contournement */}
            {bypassMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Attention :</strong> Le mode contournement désactive temporairement la sécurité biométrique. 
                    Utilisez cette option uniquement si nécessaire.
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleBypassAccess}
                    variant="destructive"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Accès...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Accéder sans authentification
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => setBypassMode(false)}
                    variant="outline"
                  >
                    Annuler
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Action Button - Optionnel */}
            {verificationStatus !== 'success' && biometricSupported && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={isFirstTime ? handleBiometricRegistration : handleBiometricVerification}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isFirstTime ? "Enregistrement..." : "Vérification..."}
                    </>
                  ) : (
                    <>
                      <Fingerprint className="mr-2 h-4 w-4" />
                      {isFirstTime ? "Enregistrer mon empreinte (optionnel)" : "Vérifier mon empreinte (optionnel)"}
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Fallback for unsupported devices */}
            {!biometricSupported && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Votre appareil ne supporte pas l'authentification biométrique. 
                  Veuillez utiliser un appareil compatible ou contacter l'administrateur.
                </AlertDescription>
              </Alert>
            )}

            {/* Navigation */}
            <div className="text-center space-y-2">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  ← Retour à la connexion
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
