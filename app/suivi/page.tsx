"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import { CaseTimeline } from "@/components/tracking/case-timeline"
import { CaseDetails } from "@/components/tracking/case-details"
import { motion } from "framer-motion"
import { logger } from "@/lib/logger"
import { apiService } from "@/lib/api"

function SuiviPageContent() {
  const searchParams = useSearchParams()
  const [code, setCode] = useState("")
  const [caseData, setCaseData] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")

  // Nettoyer l'historique des codes précédents pour garantir la confidentialité
  // Chaque utilisateur ne doit voir que son propre cas, pas l'historique des autres
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Supprimer l'historique des codes précédents pour la confidentialité
        localStorage.removeItem('anonymous_complaint_codes')
      } catch (e) {
        logger.warn('Impossible de nettoyer l\'historique', e, 'SuiviPage')
      }
    }
  }, [])

  // Charger le code depuis l'URL si présent (lien direct depuis step-3)
  useEffect(() => {
    const codeFromUrl = searchParams.get('code')
    if (codeFromUrl) {
      setCode(codeFromUrl.toUpperCase())
      // Ne pas rechercher automatiquement, laisser l'utilisateur cliquer
    }
  }, [searchParams])

  const handleSearch = async () => {
    setError("")
    if (!code.trim()) {
      setError("Veuillez entrer un code de suivi")
      return
    }

    setIsSearching(true)
    setCaseData(null)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const trackingCode = code.trim().toUpperCase()

      const response = await fetch(`${API_URL}/complaints/tracking/${trackingCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          setError("Ce code de suivi n'est pas attribué à un signalement")
        } else {
          setError(result.message || result.error || 'Erreur lors de la recherche')
        }
        setIsSearching(false)
        return
      }

      if (result.success && result.data) {
        const complaint = result.data
        
        // Charger l'historique complet du traitement
        try {
          const history = await apiService.getComplaintTreatmentHistory(trackingCode)
          setCaseData({
            code: complaint.trackingCode,
            status: complaint.status,
            incidentType: complaint.incidentType || 'Non spécifié',
            date: new Date(complaint.createdAt).toLocaleDateString('fr-FR'),
            location: `${complaint.geolocationProvince || ''}, ${complaint.geolocationTerritory || ''}`.trim() || 'Non spécifié',
            submittedDate: new Date(complaint.createdAt).toLocaleDateString('fr-FR'),
            lastUpdate: new Date(complaint.updatedAt).toLocaleDateString('fr-FR'),
            timeline: history.history.map((step: any) => ({
              status: step.status,
              date: step.date ? new Date(step.date).toLocaleDateString('fr-FR') : null,
              description: step.description,
              completed: step.completed
            })),
            assignedServices: complaint.services?.map((s: any) => s.type) || [],
            notes: `Votre dossier est actuellement ${complaint.status}. ${complaint.servicesCount || 0} service(s) assigné(s).`,
          })
        } catch (error) {
          logger.warn('Impossible de charger l\'historique complet', error, 'SuiviPage')
          // Fallback vers une timeline basique
          const statusMap: Record<string, string> = {
            'PENDING': 'En attente',
            'IN_PROGRESS': 'En cours',
            'COMPLETED': 'Terminé',
            'CLOSED': 'Clôturé'
          }

          const timeline = [
            {
              status: "Reçue",
              date: new Date(complaint.createdAt).toLocaleDateString('fr-FR'),
              description: "Votre cas a été enregistré dans notre système",
              completed: true,
            },
            {
              status: "En cours d'analyse",
              date: complaint.status === 'IN_PROGRESS' || complaint.status === 'COMPLETED' || complaint.status === 'CLOSED' 
                ? new Date(complaint.updatedAt).toLocaleDateString('fr-FR') 
                : null,
              description: "Notre équipe examine votre dossier",
              completed: complaint.status !== 'PENDING',
            },
            {
              status: "En traitement",
              date: complaint.status === 'COMPLETED' || complaint.status === 'CLOSED'
                ? new Date(complaint.updatedAt).toLocaleDateString('fr-FR')
                : null,
              description: "Les services compétents traitent votre cas",
              completed: complaint.status === 'COMPLETED' || complaint.status === 'CLOSED',
            },
            {
              status: "Clôturée",
              date: complaint.status === 'CLOSED'
                ? new Date(complaint.updatedAt).toLocaleDateString('fr-FR')
                : null,
              description: "Le dossier a été clôturé",
              completed: complaint.status === 'CLOSED',
            },
          ]

          setCaseData({
            code: complaint.trackingCode,
            status: statusMap[complaint.status] || complaint.status,
            incidentType: complaint.incidentType || 'Non spécifié',
            date: new Date(complaint.createdAt).toLocaleDateString('fr-FR'),
            location: `${complaint.geolocationProvince || ''}, ${complaint.geolocationTerritory || ''}`.trim() || 'Non spécifié',
            submittedDate: new Date(complaint.createdAt).toLocaleDateString('fr-FR'),
            lastUpdate: new Date(complaint.updatedAt).toLocaleDateString('fr-FR'),
            timeline,
            assignedServices: complaint.services?.map((s: any) => s.type) || [],
            notes: `Votre dossier est actuellement ${statusMap[complaint.status] || complaint.status.toLowerCase()}. ${complaint.servicesCount || 0} service(s) assigné(s).`,
          })
        }
      } else {
        setError("Données invalides reçues du serveur")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la recherche'
      setError(errorMessage)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-secondary/20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Suivi de cas</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Entrez votre code confidentiel pour consulter l'état de votre dossier.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Search Card */}
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle>Rechercher votre dossier</CardTitle>
                <CardDescription>
                  Utilisez le code unique qui vous a été fourni lors du signalement de cas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Code de suivi</Label>
                    <div className="flex gap-2">
                      <Input
                        id="code"
                        placeholder="XXX-XXX-XXX"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="flex-1 font-mono"
                      />
                      <Button onClick={handleSearch} disabled={isSearching} className="gap-2">
                        <Search className="h-4 w-4" />
                        {isSearching ? "Recherche..." : "Rechercher"}
                      </Button>
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <p className="text-xs text-muted-foreground mt-2">
                      🔒 Votre code de suivi est confidentiel. Aucun historique n'est conservé pour garantir votre confidentialité.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Case Information */}
            {caseData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <CaseDetails data={caseData} />
                <CaseTimeline timeline={caseData.timeline} />
              </motion.div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function SuiviPage() {
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
      <SuiviPageContent />
    </Suspense>
  )
}
