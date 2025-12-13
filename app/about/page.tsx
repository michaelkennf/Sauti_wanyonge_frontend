"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { FileText, MessageCircle, Target, Shield, Users, Globe } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function AboutPage() {
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
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">À propos de Sauti ya wa nyonge</h1>
              <p className="text-xl md:text-2xl leading-relaxed text-primary-foreground/90">
                Sauti ya wa nyonge est une plateforme de signalement et de documentation des cas de violences sexuelles liées aux conflits et autres crimes graves en République démocratique du Congo. 
                Anonyme, sécurisée et disponible 24h/24, elle garantit confidentialité, sécurité et accès rapide aux services d'assistance.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-8 w-8 text-primary" />
                  <h2 className="text-3xl md:text-4xl font-bold">Notre mission</h2>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Offrir un guichet numérique confidentiel, anonyme et sécurisé pour que chaque victime ou témoin puisse
                  signaler un cas, obtenir une première assistance et être orienté(e) vers des services adaptés pour les violences sexuelles liées aux conflits et autres crimes graves.
                </p>
              </motion.div>

              {/* Services Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-12"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-8 w-8 text-primary" />
                  <h2 className="text-3xl md:text-4xl font-bold">Nos services</h2>
                </div>
                <ul className="space-y-3 text-lg text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Signalement de cas anonyme ou identifié (Viol, Harcèlement sexuel, Zoophilie, Mariage forcé, Proxénétisme, Attentat à la pudeur, Autres crimes graves)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Chatbot d'assistance 24/7</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Orientation vers centres médicaux, juridiques et psychosociaux</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Suivi de cas avec code confidentiel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Documentation et analyse des cas pour les autorités et ONG</span>
                  </li>
                </ul>
              </motion.div>

              {/* Security Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-12"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                  <h2 className="text-3xl md:text-4xl font-bold">Gouvernance & sécurité des données</h2>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Données hébergées sur serveur souverain, chiffrement en transit et au repos, journalisation et
                  contrôle d'accès strictes. Le Ministère du Genre et les partenaires veillent à la protection des
                  informations.
                </p>
              </motion.div>

              {/* Coverage Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-12"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="h-8 w-8 text-primary" />
                  <h2 className="text-3xl md:text-4xl font-bold">Zone d'intervention</h2>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Plateforme déployable sur toute la RDC avec priorité aux zones affectées par les conflits où les violences sexuelles liées aux conflits sont les plus fréquentes (Beni, Butembo, Goma, Bukavu, etc.).
                </p>
              </motion.div>

              {/* Partners Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Partenaires</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  PNUD, FONAREV, Ministère du Genre, ONG locales, institutions judiciaires et de santé.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Besoin d'aide maintenant ?</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/plainte">
                    <FileText className="h-5 w-5" />
                    Signaler un cas
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2 bg-transparent">
                  <Link href="/chatbot">
                    <MessageCircle className="h-5 w-5" />
                    Parler à l'assistant
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
