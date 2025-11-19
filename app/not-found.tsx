"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft, Search } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

export default function NotFoundPage() {
  const router = useRouter()

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
              <CardTitle className="text-3xl font-bold text-primary mb-2">
                404
              </CardTitle>
              <CardDescription className="text-lg">
                Page non trouvée
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              La page que vous recherchez n'existe pas ou a été déplacée.
            </p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => router.push("/")}
                className="w-full gap-2"
              >
                <Home className="h-4 w-4" />
                Retour à l'accueil
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="w-full gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Page précédente
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Si vous pensez qu'il s'agit d'une erreur, contactez notre équipe de support.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
