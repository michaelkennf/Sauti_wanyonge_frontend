"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Phone, Mail, Send, ArrowLeft, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

function ContacterAgentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const trackingCode = searchParams.get('code') || ''
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "question",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pré-remplir le message avec le code de suivi si disponible
  useEffect(() => {
    if (trackingCode) {
      setFormData(prev => ({
        ...prev,
        message: `Bonjour,\n\nJe souhaite contacter un agent concernant mon dossier avec le code de suivi : ${trackingCode}.\n\n`
      }))
    }
  }, [trackingCode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: Implémenter l'envoi du message à l'agent via l'API
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      
      const response = await fetch(`${API_URL}/contact/agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          trackingCode: trackingCode || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Erreur lors de l\'envoi du message')
      }

      toast({
        title: "Message envoyé avec succès",
        description: "Un agent vous contactera dans les plus brefs délais.",
      })

      // Réinitialiser le formulaire
      setFormData({
        name: "",
        phone: "",
        email: "",
        subject: "question",
        message: trackingCode ? `Bonjour,\n\nJe souhaite contacter un agent concernant mon dossier avec le code de suivi : ${trackingCode}.\n\n` : "",
      })

      // Rediriger vers la page de suivi après 2 secondes
      setTimeout(() => {
        if (trackingCode) {
          router.push(`/suivi?code=${trackingCode}`)
        } else {
          router.push('/suivi')
        }
      }, 2000)
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-secondary/20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Contacter un agent
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Remplissez le formulaire ci-dessous pour contacter un agent. Nous vous répondrons dans les plus brefs délais.
              </p>
              {trackingCode && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm text-blue-900 dark:text-blue-300">
                    Code de suivi : <span className="font-mono font-semibold">{trackingCode}</span>
                  </p>
                </div>
              )}
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle>Formulaire de contact</CardTitle>
                  <CardDescription>
                    Tous les champs marqués d'un astérisque (*) sont obligatoires
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Nom complet <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Votre nom complet"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          Téléphone <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+243 XXX XXX XXX"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="votre@email.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">
                        Sujet <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) => setFormData({ ...formData, subject: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un sujet" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="question">Question sur mon dossier</SelectItem>
                          <SelectItem value="update">Demande de mise à jour</SelectItem>
                          <SelectItem value="urgent">Demande urgente</SelectItem>
                          <SelectItem value="information">Demande d'information</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">
                        Message <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Décrivez votre demande ou votre question..."
                        rows={6}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.message.length} caractères
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (trackingCode) {
                            router.push(`/suivi?code=${trackingCode}`)
                          } else {
                            router.push('/suivi')
                          }
                        }}
                        className="gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Retour au suivi
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Envoyer le message
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle>Autres moyens de contact</CardTitle>
                  <CardDescription>
                    Vous pouvez également nous contacter directement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Téléphone</p>
                        <p className="text-sm text-muted-foreground">+243 XXX XXX XXX</p>
                        <p className="text-xs text-muted-foreground mt-1">Lun - Ven, 8h - 18h</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Email</p>
                        <p className="text-sm text-muted-foreground">contact@sautiyawanyonge.cd</p>
                        <p className="text-xs text-muted-foreground mt-1">Réponse sous 24-48h</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function ContacterAgentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-secondary/20 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <ContacterAgentContent />
    </Suspense>
  )
}
