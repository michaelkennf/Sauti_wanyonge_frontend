"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Mic, Video, X, StopCircle } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import type { ComplaintData } from "@/app/plainte/page"
import { useMediaRecorder } from "@/hooks/use-media-recorder"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Step2Props = {
  data: Partial<ComplaintData>
  updateData: (data: Partial<ComplaintData>) => void
  onNext: () => void
  onBack: () => void
}

const incidentTypes = [
  "Viol",
  "Harcèlement sexuel",
  "Zoophilie",
  "Mariage forcé",
  "Proxénétisme",
  "Attentat à la pudeur",
  "Autres crimes graves",
]

const needsOptions = [
  "Soins médicaux",
  "Assistance psychologique",
  "Aide juridique",
  "Protection immédiate",
  "Hébergement d'urgence",
]

export function ComplaintStep2({ data, updateData, onNext, onBack }: Step2Props) {
  const { toast } = useToast()
  const [incidentType, setIncidentType] = useState(data.incidentType ?? "")
  const [date, setDate] = useState(data.date ?? "")
  const [location, setLocation] = useState(data.location ?? "")
  const [description, setDescription] = useState(data.description ?? "")
  const [evidence, setEvidence] = useState<File[]>(data.evidence ?? [])
  const [needs, setNeeds] = useState<string[]>(data.needs ?? [])
  const [recordingType, setRecordingType] = useState<'audio' | 'video' | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showOtherCrimesDialog, setShowOtherCrimesDialog] = useState(false)
  const [otherCrimesDetails, setOtherCrimesDetails] = useState("")
  
  // Hook pour l'enregistrement audio
  const audioRecorder = useMediaRecorder({ maxDuration: 35, audioOnly: true })
  
  // Hook pour l'enregistrement vidéo
  const videoRecorder = useMediaRecorder({ maxDuration: 35, videoOnly: false })
  const videoPreviewRef = useRef<HTMLVideoElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEvidence([...evidence, ...Array.from(e.target.files)])
    }
  }

  const removeFile = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index))
  }

  // Gérer l'enregistrement audio
  const handleAudioRecording = async () => {
    if (audioRecorder.isRecording) {
      audioRecorder.stopRecording()
      setRecordingType(null)
    } else {
      try {
        await audioRecorder.startRecording()
        setRecordingType('audio')
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de démarrer l'enregistrement audio",
          variant: "destructive"
        })
      }
    }
  }

  // Gérer l'enregistrement vidéo
  const handleVideoRecording = async () => {
    if (videoRecorder.isRecording) {
      videoRecorder.stopRecording()
      setRecordingType(null)
      // Arrêter le preview vidéo
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = null
      }
    } else {
      try {
        await videoRecorder.startRecording()
        setRecordingType('video')
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de démarrer l'enregistrement vidéo",
          variant: "destructive"
        })
      }
    }
  }

  // Mettre à jour le preview vidéo quand le stream change
  useEffect(() => {
    const videoElement = videoPreviewRef.current
    if (!videoElement) return

    if (videoRecorder.isRecording && videoRecorder.stream) {
      // S'assurer que le stream est bien connecté
      videoElement.srcObject = videoRecorder.stream
      videoElement.muted = true // Nécessaire pour autoplay
      videoElement.playsInline = true
      
      // Forcer la lecture
      videoElement.play().catch((error) => {
        console.warn('Erreur lors de la lecture du preview vidéo:', error)
      })
    } else {
      // Nettoyer seulement quand l'enregistrement est vraiment terminé
      if (!videoRecorder.isRecording) {
        videoElement.srcObject = null
      }
    }

    // Nettoyage
    return () => {
      if (videoElement && !videoRecorder.isRecording) {
        videoElement.srcObject = null
      }
    }
  }, [videoRecorder.isRecording, videoRecorder.stream])

  // Ajouter les enregistrements aux preuves quand ils sont terminés
  useEffect(() => {
    if (audioRecorder.mediaBlob && recordingType === 'audio') {
      const audioFile = new File([audioRecorder.mediaBlob], `audio_${Date.now()}.webm`, { type: 'audio/webm' })
      setEvidence([...evidence, audioFile])
      updateData({ audioRecording: audioRecorder.mediaBlob })
      audioRecorder.resetRecording()
      setRecordingType(null)
    }
  }, [audioRecorder.mediaBlob, recordingType])

  useEffect(() => {
    if (videoRecorder.mediaBlob && recordingType === 'video') {
      const videoFile = new File([videoRecorder.mediaBlob], `video_${Date.now()}.webm`, { type: 'video/webm' })
      setEvidence([...evidence, videoFile])
      updateData({ videoRecording: videoRecorder.mediaBlob })
      videoRecorder.resetRecording()
      setRecordingType(null)
    }
  }, [videoRecorder.mediaBlob, recordingType])

  // Nettoyer les enregistrements au démontage
  useEffect(() => {
    return () => {
      audioRecorder.cleanup()
      videoRecorder.cleanup()
    }
  }, [])

  const toggleNeed = (need: string) => {
    setNeeds((prev) => (prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]))
  }

  const handleOtherCrimesConfirm = () => {
    if (!otherCrimesDetails.trim()) {
      toast({
        title: "Champ requis",
        description: "Veuillez préciser de quel type de crime il s'agit.",
        variant: "destructive"
      })
      return
    }
    setIncidentType(`Autres crimes graves: ${otherCrimesDetails}`)
    setShowOtherCrimesDialog(false)
    setOtherCrimesDetails("")
  }

  const handleClearOtherCrimes = () => {
    setOtherCrimesDetails("")
    setIncidentType("")
    setShowOtherCrimesDialog(false)
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
        <CardTitle className="text-2xl">Détails du cas</CardTitle>
        <CardDescription>
          Fournissez autant d'informations que possible pour nous aider à traiter votre cas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="incidentType">
            Type d'incident <span className="text-destructive">*</span>
          </Label>
          <Select 
            value={incidentType} 
            onValueChange={(value) => {
              if (value === "Autres crimes graves") {
                setShowOtherCrimesDialog(true)
              } else {
                setIncidentType(value)
              }
            }}
          >
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
              className={`gap-2 bg-transparent ${recordingType === 'audio' ? 'border-destructive text-destructive' : ''}`}
              onClick={handleAudioRecording}
              disabled={recordingType === 'video'}
            >
              {recordingType === 'audio' ? (
                <>
                  <StopCircle className="h-4 w-4" />
                  Arrêter ({audioRecorder.duration}s)
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Enregistrer audio
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className={`gap-2 bg-transparent ${recordingType === 'video' ? 'border-destructive text-destructive' : ''}`}
              onClick={handleVideoRecording}
              disabled={recordingType === 'audio'}
            >
              {recordingType === 'video' ? (
                <>
                  <StopCircle className="h-4 w-4" />
                  Arrêter ({videoRecorder.duration}s)
                </>
              ) : (
                <>
                  <Video className="h-4 w-4" />
                  Enregistrer vidéo
                </>
              )}
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
          {/* Preview vidéo pendant l'enregistrement */}
          {recordingType === 'video' && videoRecorder.isRecording && (
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border-2 border-destructive">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }} // Miroir pour selfie
              />
              {!videoRecorder.stream && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <p className="text-white text-sm">Initialisation de la caméra...</p>
                </div>
              )}
              <div className="absolute top-2 right-2 bg-destructive/90 backdrop-blur-sm text-destructive-foreground px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg">
                <div className="w-2 h-2 bg-destructive-foreground rounded-full animate-pulse" />
                Enregistrement ({videoRecorder.duration}s)
              </div>
            </div>
          )}

          {evidence.length > 0 && (
            <div className="space-y-3">
              {evidence.map((file, index) => {
                const isAudio = file.type.startsWith('audio/')
                const isVideo = file.type.startsWith('video/')
                const fileUrl = URL.createObjectURL(file)
                
                return (
                  <div key={index} className="flex flex-col gap-2 p-3 bg-secondary rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate flex-1">{file.name}</span>
                      <div className="flex items-center gap-2">
                        {(isAudio || isVideo) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (isAudio) {
                                const audio = new Audio(fileUrl)
                                audio.play().catch(console.error)
                              } else if (isVideo) {
                                const video = document.createElement('video')
                                video.src = fileUrl
                                video.controls = true
                                video.style.width = '100%'
                                video.style.maxWidth = '500px'
                                const container = document.createElement('div')
                                container.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80'
                                container.onclick = () => container.remove()
                                container.appendChild(video)
                                document.body.appendChild(container)
                                video.play().catch(console.error)
                              }
                            }}
                            className="h-8 px-3"
                          >
                            {isAudio ? '▶️ Écouter' : '▶️ Voir'}
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            URL.revokeObjectURL(fileUrl)
                            removeFile(index)
                          }}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                    </p>
                  </div>
                )
              })}
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

      {/* Dialog pour "Autres crimes graves" */}
      <Dialog open={showOtherCrimesDialog} onOpenChange={setShowOtherCrimesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Préciser le type de crime</DialogTitle>
            <DialogDescription>
              Veuillez préciser de quel type de crime grave il s'agit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otherCrimesDetails">
                Détails du crime <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="otherCrimesDetails"
                placeholder="Exemples: Crime de génocide, Crimes contre l'humanité, Crimes de guerre, Traite des personnes, Torture, etc."
                value={otherCrimesDetails}
                onChange={(e) => setOtherCrimesDetails(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Exemples: Crimes contre la paix et la sécurité de l'humanité (Crime de génocide, Crimes contre l'humanité, Crimes de guerre), Traite des personnes, Torture, etc.
              </p>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClearOtherCrimes}
            >
              Effacer
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowOtherCrimesDialog(false)
                setOtherCrimesDetails("")
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleOtherCrimesConfirm}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
