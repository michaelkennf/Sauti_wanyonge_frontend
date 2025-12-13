"use client"

import type React from "react"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Mail, MapPin, HelpCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    province: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Handle form submission
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-accent text-primary-foreground py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">Contactez-nous</h1>
              <p className="text-xl leading-relaxed text-primary-foreground/90">
                Pour toute question institutionnelle, formation, ou demande de partenariat, utilisez le formulaire
                ci-dessous. Pour les urgences, veuillez appeler les numéros d'urgence listés dans la section
                d'assistance.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <h2 className="text-3xl font-bold mb-6">Formulaire de contact</h2>
              <p className="text-muted-foreground mb-8">
                Pour partenaires et institutions. Remplissez le formulaire ci-dessous.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l'organisation / Nom complet *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Votre nom ou organisation"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
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
                  <Label htmlFor="province">Province / Région</Label>
                  <Select
                    value={formData.province}
                    onValueChange={(value) => setFormData({ ...formData, province: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kinshasa">Kinshasa</SelectItem>
                      <SelectItem value="nord-kivu">Nord-Kivu</SelectItem>
                      <SelectItem value="sud-kivu">Sud-Kivu</SelectItem>
                      <SelectItem value="ituri">Ituri</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Sujet</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData({ ...formData, subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un sujet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="partenariat">Partenariat</SelectItem>
                      <SelectItem value="support">Support technique</SelectItem>
                      <SelectItem value="formation">Formation</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Votre message..."
                    rows={6}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full">
                  Envoyer la demande
                </Button>
              </form>
            </motion.div>

            {/* Contact Info & FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Emergency Contacts */}
              <div className="bg-card p-6 rounded-2xl border shadow-lg">
                <h3 className="text-2xl font-bold mb-4">Contacts urgents / assistance</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold">Numéros d'urgence</p>
                      <p className="text-muted-foreground">+243 XXX XXX XXX</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold">Email officiel</p>
                      <p className="text-muted-foreground">contact@sautiyawanyonge.cd</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold">Siège administratif</p>
                      <p className="text-muted-foreground">Kinshasa, République Démocratique du Congo</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-card p-6 rounded-2xl border shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">FAQ rapide</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold mb-1">Comment signaler un cas ?</p>
                    <p className="text-muted-foreground text-sm">
                      <Link href="/plainte" className="text-primary hover:underline">
                        Cliquez ici pour signaler un cas
                      </Link>
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Est-ce anonyme ?</p>
                    <p className="text-muted-foreground text-sm">
                      Oui, vous avez l'option de rester complètement anonyme lors du signalement de votre cas.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Comment suivre mon cas ?</p>
                    <p className="text-muted-foreground text-sm">
                      Entrez votre code de suivi sur la{" "}
                      <Link href="/suivi" className="text-primary hover:underline">
                        page « Consulter un cas »
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
