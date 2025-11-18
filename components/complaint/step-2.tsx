"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Mic, Video, X } from "lucide-react"
import { useState, useRef } from "react"
import type { ComplaintData } from "@/app/plainte/page"

type Step2Props = {
  data: Partial<ComplaintData>
  updateData: (data: Partial<ComplaintData>) => void
  onNext: () => void
  onBack: () => void
}

const incidentTypes = [
  "Viol",
  "Harcèlement sexuel",
  "Enlèvement",
  "Menaces et intimidation",
  "Mariage forcé",
  "Détention illégale",
  "Exploitation sexuelle",
  "Violence domestique",
  "Autre",
]

const needsOptions = [
  "Soins médicaux",
  "Assistance psychologique",
  "Aide juridique",
  "Protection immédiate",
  "Hébergement d'urgence",
]

export function ComplaintStep2({ data, updateData, onNext, onBack }: Step2Props) {
  const [incidentType, setIncidentType] = useState(data.incidentType ?? "")
  const [date, setDate] = useState(data.date ?? "")
  const [location, setLocation] = useState(data.location ?? "")
  const [description, setDescription] = useState(data.description ?? "")
  const [evidence, setEvidence] = useState<File[]>(data.evidence ?? [])
  const [needs, setNeeds] = useState<string[]>(data.needs ?? [])
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEvidence([...evidence, ...Array.from(e.target.files)])
    }
  }

  const removeFile = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index))
  }

  const toggleNeed = (need: string) => {
    setNeeds((prev) => (prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]))
  }

  const handleNext = () => {
    if (!incidentType || !date || !location || !description) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }
    updateData({
      incidentType,
      date,
      location,
      description,
      evidence,
      needs,
    })
    onNext()
  }

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Détails de la plainte</CardTitle>
        <CardDescription>
          Fournissez autant d'informations que possible pour nous aider à traiter votre cas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="incidentType">
            Type d'incident <span className="text-destructive">*</span>
          </Label>
          <Select value={incidentType} onValueChange={setIncidentType}>
            <SelectTrigger id="incidentType">
              <SelectValue placeholder="Sélectionnez le type d'incident" />
            </SelectTrigger>
            <SelectContent>
              {incidentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">
              Date de l'incident <span className="text-destructive">*</span>
            </Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">
              Lieu de l'incident <span className="text-destructive">*</span>
            </Label>
            <Input
              id="location"
              placeholder="Ville, quartier, adresse"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Description détaillée <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Décrivez ce qui s'est passé avec autant de détails que possible..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        <div className="space-y-4">
          <Label>Preuves (facultatif)</Label>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
              <Upload className="h-4 w-4" />
              Télécharger des fichiers
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={() => setIsRecording(!isRecording)}
            >
              <Mic className="h-4 w-4" />
              {isRecording ? "Arrêter" : "Enregistrer audio"}
            </Button>
            <Button type="button" variant="outline" className="gap-2 bg-transparent">
              <Video className="h-4 w-4" />
              Enregistrer vidéo
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          {evidence.length > 0 && (
            <div className="space-y-2">
              {evidence.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Label>Besoins immédiats</Label>
          <div className="space-y-3">
            {needsOptions.map((need) => (
              <div key={need} className="flex items-center space-x-2">
                <Checkbox id={need} checked={needs.includes(need)} onCheckedChange={() => toggleNeed(need)} />
                <Label htmlFor={need} className="cursor-pointer font-normal">
                  {need}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button onClick={onBack} variant="outline" size="lg" className="min-w-[150px] bg-transparent">
            Retour
          </Button>
          <Button onClick={handleNext} size="lg" className="min-w-[150px]">
            Suivant
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
