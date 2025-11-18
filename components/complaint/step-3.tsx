"use client"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Download, Mail, Copy, Check } from "lucide-react"
import { useState } from "react"
import type { ComplaintData } from "@/app/plainte/page"
import Link from "next/link"

type Step3Props = {
  data: Partial<ComplaintData>
  onBack: () => void
}

export function ComplaintStep3({ data, onBack }: Step3Props) {
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  // Generate a unique code
  const uniqueCode = `${Math.random().toString(36).substring(2, 5).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`

  const copyCode = () => {
    navigator.clipboard.writeText(uniqueCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadCode = () => {
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
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Votre code confidentiel unique</p>
            <p className="text-3xl font-bold text-primary tracking-wider">{uniqueCode}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={copyCode} variant="outline" className="flex-1 gap-2 bg-transparent">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copié !" : "Copier le code"}
            </Button>
            <Button onClick={downloadCode} variant="outline" className="flex-1 gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Télécharger
            </Button>
          </div>
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
