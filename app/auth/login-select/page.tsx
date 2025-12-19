"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Fingerprint, User, Building2, Shield, Home } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function LoginSelectPage() {
  const router = useRouter()

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
              Sélectionnez votre type de compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/auth/investigator-login" className="block">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <Fingerprint className="h-12 w-12 text-primary" />
                        <div>
                          <h3 className="font-semibold text-lg">Connexion Enquêteur</h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            Accédez à votre Documentation de cas
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>

              <Link href="/auth/login" className="block">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <User className="h-12 w-12 text-primary" />
                        <div>
                          <h3 className="font-semibold text-lg">Autres connexions</h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            Admin, ONG, Assurance, etc.
                          </p>
                        </div>
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

