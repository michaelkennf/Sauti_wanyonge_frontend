"use client"

import { useState } from "react"
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

export default function SuiviPage() {
  const [code, setCode] = useState("")
  const [caseData, setCaseData] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = () => {
    setError("")
    if (!code.trim()) {
      setError("Veuillez entrer un code de suivi")
      return
    }

    setIsSearching(true)

    // Simulate API call
    setTimeout(() => {
      // Mock data
      setCaseData({
        code: code.toUpperCase(),
        status: "En cours",
        incidentType: "Harcèlement sexuel",
        date: "2024-01-15",
        location: "Kinshasa, Ngaliema",
        submittedDate: "2024-01-16",
        lastUpdate: "2024-01-20",
        timeline: [
          {
            status: "Reçue",
            date: "2024-01-16",
            description: "Votre plainte a été enregistrée dans notre système",
            completed: true,
          },
          {
            status: "En cours d'analyse",
            date: "2024-01-18",
            description: "Notre équipe examine votre dossier",
            completed: true,
          },
          {
            status: "Transmise aux services",
            date: "2024-01-20",
            description: "Votre dossier a été transmis aux services compétents",
            completed: true,
          },
          {
            status: "En traitement",
            date: null,
            description: "Les services compétents traitent votre cas",
            completed: false,
          },
          {
            status: "Clôturée",
            date: null,
            description: "Le dossier sera clôturé une fois le traitement terminé",
            completed: false,
          },
        ],
        assignedServices: ["Centre Médical Lisanga", "Clinique Juridique de Kinshasa"],
        notes: "Votre dossier est actuellement en cours de traitement. Vous serez contacté sous 48h.",
      })
      setIsSearching(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-secondary/20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Suivi de plainte</h1>
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
                  Utilisez le code unique qui vous a été fourni lors du dépôt de plainte
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
