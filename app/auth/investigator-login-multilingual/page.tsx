"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Fingerprint, Shield, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useTranslation, useLocale } from "@/hooks/use-translation"

export default function InvestigatorLoginPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { languageFlag, languageName } = useLocale()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [biometricSupported, setBiometricSupported] = useState(false)

  // Vérifier le support biométrique au chargement
  useState(() => {
    if (typeof window !== "undefined") {
      setBiometricSupported(
        window.PublicKeyCredential !== undefined &&
        typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function"
      )
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulation de l'authentification enquêteur
      const response = await fetch("/api/auth/investigator-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirection vers le formulaire enquêteur
        router.push("/enqueteur/formulaire")
      } else {
        setError(data.message || t('auth.loginError'))
      }
    } catch (err) {
      setError(t('auth.loginError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleBiometricLogin = async () => {
    if (!biometricSupported) {
      setError(t('auth.biometricSupported'))
      return
    }

    try {
      // Simulation de l'authentification biométrique WebAuthn
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "Sauti ya Wayonge" },
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

      // Redirection après authentification biométrique réussie
      router.push("/enqueteur/formulaire")
    } catch (err) {
      setError(t('auth.biometricFailed'))
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
                  alt="Sauti ya Wayonge"
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                <Shield className="h-6 w-6" />
                {t('auth.investigatorLogin')}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                {t('auth.login')} - {languageFlag} {languageName}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t('auth.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="enqueteur@sauti-ya-wayonge.rdc"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {t('auth.password')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="h-12 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
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

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('auth.loginButton')}...
                    </>
                  ) : (
                    t('auth.loginButton')
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Authentification biométrique */}
            {biometricSupported && (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Ou</span>
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-primary/20 hover:bg-primary/5"
                    onClick={handleBiometricLogin}
                  >
                    <Fingerprint className="mr-2 h-4 w-4 text-primary" />
                    {t('auth.biometricAuth')}
                  </Button>
                </motion.div>
              </div>
            )}

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('auth.noAccount')}
              </p>
              <Link href="/auth/register-investigator">
                <Button variant="link" className="text-primary hover:text-primary/80">
                  {t('auth.requestAccess')}
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  {t('auth.backToStandard')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
