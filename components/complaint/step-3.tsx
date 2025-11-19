"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Download, Mail, Copy, Check, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import type { ComplaintData } from "@/app/plainte/page"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

type Step3Props = {
  data: Partial<ComplaintData>
  onBack: () => void
}

export function ComplaintStep3({ data, onBack }: Step3Props) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uniqueCode, setUniqueCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Envoyer la plainte au backend au chargement du composant
  useEffect(() => {
    const submitComplaint = async () => {
      if (uniqueCode) return // Déjà soumis

      setIsSubmitting(true)
      setError(null)

      try {
        // Obtenir la géolocalisation
        let latitude = 0
        let longitude = 0
        let accuracy = 0

        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
            })
            latitude = position.coords.latitude
            longitude = position.coords.longitude
            accuracy = position.coords.accuracy
          } catch (geoError) {
            console.warn('Géolocalisation non disponible:', geoError)
            // Utiliser des coordonnées par défaut pour Kinshasa
            latitude = -4.3276
            longitude = 15.3136
          }
        }

        // Préparer les données de la plainte
        // Le backend résoudra automatiquement la géolocalisation à partir de latitude/longitude
        const complaintPayload = {
          type: 'VICTIM_DIRECT' as const,
          priority: 'MEDIUM' as const,
          beneficiaryData: {
            name: data.isAnonymous ? 'Anonyme' : (data.name || 'Non spécifié'),
            sex: 'OTHER' as const,
            age: 0,
            territory: 'Non spécifié',
            groupement: 'Non spécifié',
            village: 'Non spécifié',
            householdSize: 1,
            currentAddress: data.location || 'Non spécifié',
            status: 'Victime',
            natureOfFacts: data.incidentType || data.description || 'Non spécifié'
          },
          geolocation: {
            latitude,
            longitude
          },
          evidence: [],
          services: data.needs || []
        }

        // Envoyer la plainte au backend
        const response = await fetch(`${API_URL}/complaints/victim`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(complaintPayload)
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || result.error || 'Erreur lors de la soumission de la plainte')
        }

        if (result.success && result.data?.trackingCode) {
          setUniqueCode(result.data.trackingCode)
          toast({
            title: "Succès",
            description: "Votre plainte a été enregistrée avec succès",
          })
        } else {
          throw new Error('Code de suivi non reçu du serveur')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la soumission de la plainte'
        setError(errorMessage)
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive"
        })
      } finally {
        setIsSubmitting(false)
      }
    }

    submitComplaint()
  }, [data, uniqueCode, toast])

  const copyCode = () => {
    if (uniqueCode && typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(uniqueCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadCode = () => {
    if (!uniqueCode) return
    
    const element = document.createElement("a")
    const file = new Blob(
      [
        `Code de suivi de plainte: ${uniqueCode}\n\nConservez ce code précieusement pour suivre l'évolution de votre dossier sur https://sautiyawayonge.cd/suivi\n\nDate de dépôt: ${new Date().toLocaleDateString("fr-FR")}`,
      ],
      { type: "text/plain" },
    )
    element.href = URL.createObjectURL(file)
    element.download = `code-plainte-${uniqueCode}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const sendEmail = () => {
    // Simulate email sending
    setTimeout(() => {
      setEmailSent(true)
    }, 1000)
  }

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
          </div>
        </div>
        <CardTitle className="text-2xl">Plainte enregistrée avec succès</CardTitle>
        <CardDescription>
          Votre plainte a été reçue et sera traitée dans les plus brefs délais. Conservez votre code confidentiel.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="bg-secondary/50 rounded-lg p-6 space-y-3">
          <h3 className="font-semibold text-lg mb-4">Résumé de votre plainte</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type d'incident:</span>
              <span className="font-medium">{data.incidentType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">{data.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lieu:</span>
              <span className="font-medium">{data.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Statut:</span>
              <span className="font-medium">{data.isAnonymous ? "Anonyme" : "Avec contact"}</span>
            </div>
          </div>
        </div>

        {/* Unique Code */}
        <div className="border-2 border-primary rounded-lg p-6 space-y-4">
          {isSubmitting ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-sm text-muted-foreground">Enregistrement de votre plainte...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Réessayer
              </Button>
            </div>
          ) : uniqueCode ? (
            <>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Votre code confidentiel unique</p>
                <p className="text-3xl font-bold text-primary tracking-wider">{uniqueCode}</p>
              </div>
            </>
          ) : null}

          {uniqueCode && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={copyCode} variant="outline" className="flex-1 gap-2 bg-transparent" disabled={!uniqueCode}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copié !" : "Copier le code"}
              </Button>
              <Button onClick={downloadCode} variant="outline" className="flex-1 gap-2 bg-transparent" disabled={!uniqueCode}>
                <Download className="h-4 w-4" />
                Télécharger
              </Button>
            </div>
          )}
        </div>

        {/* Email Option */}
        {!data.isAnonymous && !emailSent && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Recevoir le code par e-mail</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={sendEmail} className="gap-2">
                <Mail className="h-4 w-4" />
                Envoyer
              </Button>
            </div>
          </div>
        )}

        {emailSent && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
            <p className="text-sm text-green-800 dark:text-green-300">Le code a été envoyé à votre adresse e-mail.</p>
          </div>
        )}

        {/* Security Message */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-300">Confidentialité et sécurité</h4>
          <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
            <li>• Vos données sont chiffrées et sécurisées</li>
            <li>• Seuls les services autorisés peuvent accéder à votre dossier</li>
            <li>• Vous pouvez suivre l'évolution de votre plainte à tout moment</li>
            <li>• Aucune information ne sera partagée sans votre consentement</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button asChild variant="outline" className="flex-1 bg-transparent">
            <Link href="/suivi">Suivre ma plainte</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
