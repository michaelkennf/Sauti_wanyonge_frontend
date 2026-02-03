"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Mic, Video, X, StopCircle, Play, Pause, Trash2, FileAudio, FileVideo, Image as ImageIcon } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import type { ComplaintData } from "@/app/plainte/page"
import { useMediaRecorder } from "@/hooks/use-media-recorder"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { compressMediaFile } from "@/lib/media-compression"

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
  const { addToast } = useToast()
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
  
  // Hook pour l'enregistrement audio (max 60 secondes = 1 minute)
  const audioRecorder = useMediaRecorder({ maxDuration: 60, audioOnly: true })
  
  // Hook pour l'enregistrement vidéo (max 35 secondes)
  // videoOnly: false signifie qu'on veut audio + vidéo (enregistrement vidéo avec son)
  const videoRecorder = useMediaRecorder({ maxDuration: 35, videoOnly: false, audioOnly: false })
  const videoPreviewRef = useRef<HTMLVideoElement>(null)
  
  // Log du state du videoRecorder pour débogage
  // Utiliser des valeurs primitives dans les dépendances, pas l'objet entier
  const isRecording = videoRecorder.isRecording
  const stream = videoRecorder.stream
  const duration = videoRecorder.duration
  const error = videoRecorder.error
  
  useEffect(() => {
    if (recordingType === 'video') {
      console.log('📹 State videoRecorder mis à jour:', {
        isRecording,
        hasStream: !!stream,
        duration,
        error,
        streamActive: stream?.active,
        streamId: stream?.id
      })
    }
  }, [isRecording, stream, duration, error, recordingType])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      
      // Compresser les fichiers avant de les ajouter
      try {
        addToast("Compression des fichiers en cours...", "info")
        const compressedFiles = await Promise.all(
          files.map(file => compressMediaFile(file))
        )
        setEvidence([...evidence, ...compressedFiles])
        addToast(`${compressedFiles.length} fichier(s) compressé(s) et ajouté(s)`, "success")
      } catch (error) {
        console.error('Erreur lors de la compression:', error)
        addToast("Erreur lors de la compression, ajout des fichiers originaux", "warning")
        setEvidence([...evidence, ...files])
      }
    }
  }

  const removeFile = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index))
  }

  // Gérer l'enregistrement audio
  const handleAudioRecording = async () => {
    if (audioRecorder.isRecording) {
      // Arrêter l'enregistrement - le mediaBlob sera créé automatiquement
      audioRecorder.stopRecording()
      // Ne pas mettre recordingType à null immédiatement - laisser le useEffect gérer
      // Le recordingType sera mis à null dans le useEffect une fois le fichier ajouté
    } else {
      try {
        await audioRecorder.startRecording()
        setRecordingType('audio')
      } catch (error) {
        addToast("Impossible de démarrer l'enregistrement audio", "error")
      }
    }
  }

  // Gérer l'enregistrement vidéo
  const handleVideoRecording = async () => {
    if (videoRecorder.isRecording) {
      // Arrêter l'enregistrement - le mediaBlob sera créé automatiquement
      videoRecorder.stopRecording()
      // Arrêter le preview vidéo
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = null
      }
      // Ne pas mettre recordingType à null immédiatement - laisser le useEffect gérer
      // Le recordingType sera mis à null dans le useEffect une fois le fichier ajouté
    } else {
      try {
        console.log('🎥 Démarrage de l\'enregistrement vidéo...')
        console.log('📊 État avant startRecording:', {
          isRecording: videoRecorder.isRecording,
          hasStream: !!videoRecorder.stream,
          duration: videoRecorder.duration
        })
        
        await videoRecorder.startRecording()
        
        // Attendre un peu pour que le state se mette à jour
        await new Promise(resolve => setTimeout(resolve, 100))
        
        console.log('✅ Enregistrement vidéo démarré:', {
          isRecording: videoRecorder.isRecording,
          hasStream: !!videoRecorder.stream,
          duration: videoRecorder.duration,
          streamActive: videoRecorder.stream?.active
        })
        
        setRecordingType('video')
      } catch (error) {
        console.error('❌ Erreur lors du démarrage de l\'enregistrement vidéo:', error)
        
        let errorMessage = 'Erreur inconnue'
        if (error instanceof Error) {
          if (error.name === 'NotReadableError' || error.message.includes('Could not start video source')) {
            errorMessage = 'La caméra est déjà utilisée par une autre application. Veuillez fermer les autres applications qui utilisent la caméra et réessayer.'
          } else if (error.name === 'NotAllowedError' || error.message.includes('Permission denied')) {
            errorMessage = 'Permission refusée. Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur.'
          } else if (error.name === 'NotFoundError' || error.message.includes('No video input')) {
            errorMessage = 'Aucune caméra trouvée. Veuillez connecter une caméra et réessayer.'
          } else {
            errorMessage = error.message
          }
        }
        
        addToast(`Impossible de démarrer l'enregistrement vidéo: ${errorMessage}`, "error")
        setRecordingType(null)
      }
    }
  }

  // Mettre à jour le preview vidéo quand le stream change
  // Utiliser des valeurs primitives dans les dépendances pour éviter les problèmes de référence
  const videoIsRecording = videoRecorder.isRecording
  const videoStream = videoRecorder.stream
  
  useEffect(() => {
    // Ne s'exécuter que si on est en mode vidéo
    if (recordingType !== 'video') {
      return
    }

    const videoElement = videoPreviewRef.current
    if (!videoElement) {
      // Le ref n'est pas encore attaché, réessayer au prochain render
      return
    }

    console.log('🎬 useEffect preview vidéo:', {
      isRecording: videoIsRecording,
      hasStream: !!videoStream,
      recordingType,
      streamActive: videoStream?.active
    })

    if (videoIsRecording && videoStream) {
      console.log('✅ Configuration du preview vidéo avec stream')
      // S'assurer que le stream est bien connecté
      videoElement.srcObject = videoStream
      videoElement.muted = true // Nécessaire pour autoplay
      videoElement.playsInline = true
      
      // Forcer la lecture
      videoElement.play().then(() => {
        console.log('✅ Preview vidéo en lecture')
      }).catch((error) => {
        console.error('❌ Erreur lors de la lecture du preview vidéo:', error)
      })
    } else {
      // Nettoyer seulement quand l'enregistrement est vraiment terminé
      if (!videoIsRecording && videoElement.srcObject) {
        console.log('🧹 Nettoyage du preview vidéo')
        videoElement.srcObject = null
      }
    }

    // Nettoyage
    return () => {
      if (videoElement && !videoIsRecording && videoElement.srcObject) {
        videoElement.srcObject = null
      }
    }
  }, [videoIsRecording, videoStream, recordingType])

  // Ajouter les enregistrements aux preuves quand ils sont terminés (affichage automatique)
  // Cette fonction s'exécute automatiquement dès qu'un mediaBlob est disponible, même si l'utilisateur arrête avant la fin
  useEffect(() => {
    // Vérifier si un enregistrement audio est disponible (peu importe si l'utilisateur a fini ou arrêté avant)
    if (audioRecorder.mediaBlob && !audioRecorder.isRecording) {
      const processAudio = async () => {
        try {
          addToast("Compression de l'enregistrement audio en cours...", "info")
          
          // Créer un File temporaire pour la compression
          const timestamp = Date.now()
          const tempFile = new File([audioRecorder.mediaBlob!], `enregistrement_audio_${timestamp}.webm`, { 
            type: 'audio/webm' 
          })
          
          // Compresser l'enregistrement audio
          const compressedFile = await compressMediaFile(tempFile)
          
          // Ajouter automatiquement à la liste des preuves
          setEvidence(prev => {
            // Vérifier si le fichier n'existe pas déjà (éviter les doublons)
            const exists = prev.some(f => f.name === compressedFile.name)
            if (exists) return prev
            return [...prev, compressedFile]
          })
          
          updateData({ audioRecording: compressedFile })
          
          // Réinitialiser l'enregistreur après un court délai pour s'assurer que le fichier est bien ajouté
          setTimeout(() => {
            audioRecorder.resetRecording()
            setRecordingType(null)
          }, 100)
          
          // Notification de succès
          addToast("Enregistrement audio compressé et ajouté avec succès", "success")
        } catch (error) {
          console.error('Erreur lors de la compression audio:', error)
          // En cas d'erreur, ajouter le fichier original
          const timestamp = Date.now()
          const audioFile = new File([audioRecorder.mediaBlob!], `enregistrement_audio_${timestamp}.webm`, { 
            type: 'audio/webm' 
          })
          setEvidence(prev => {
            const exists = prev.some(f => f.name === audioFile.name)
            if (exists) return prev
            return [...prev, audioFile]
          })
          updateData({ audioRecording: audioRecorder.mediaBlob })
          addToast("Enregistrement audio ajouté (compression échouée)", "warning")
          setTimeout(() => {
            audioRecorder.resetRecording()
            setRecordingType(null)
          }, 100)
        }
      }
      
      processAudio()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioRecorder.mediaBlob, audioRecorder.isRecording])

  useEffect(() => {
    // Vérifier si un enregistrement vidéo est disponible (peu importe si l'utilisateur a fini ou arrêté avant)
    if (videoRecorder.mediaBlob && !videoRecorder.isRecording) {
      const processVideo = async () => {
        try {
          addToast("Compression de l'enregistrement vidéo en cours...", "info")
          
          // Créer un File temporaire pour la compression
          const timestamp = Date.now()
          const tempFile = new File([videoRecorder.mediaBlob!], `enregistrement_video_${timestamp}.webm`, { 
            type: 'video/webm' 
          })
          
          // Compresser l'enregistrement vidéo
          const compressedFile = await compressMediaFile(tempFile)
          
          // Ajouter automatiquement à la liste des preuves
          setEvidence(prev => {
            // Vérifier si le fichier n'existe pas déjà (éviter les doublons)
            const exists = prev.some(f => f.name === compressedFile.name)
            if (exists) return prev
            return [...prev, compressedFile]
          })
          
          updateData({ videoRecording: compressedFile })
          
          // Réinitialiser l'enregistreur après un court délai pour s'assurer que le fichier est bien ajouté
          setTimeout(() => {
            videoRecorder.resetRecording()
            setRecordingType(null)
          }, 100)
          
          // Notification de succès
          addToast("Votre enregistrement vidéo a été compressé et ajouté avec succès.", "success")
        } catch (error) {
          console.error('Erreur lors de la compression vidéo:', error)
          // En cas d'erreur, ajouter le fichier original
          const timestamp = Date.now()
          const videoFile = new File([videoRecorder.mediaBlob!], `enregistrement_video_${timestamp}.webm`, { 
            type: 'video/webm' 
          })
          setEvidence(prev => {
            const exists = prev.some(f => f.name === videoFile.name)
            if (exists) return prev
            return [...prev, videoFile]
          })
          updateData({ videoRecording: videoRecorder.mediaBlob })
          addToast("Enregistrement vidéo ajouté (compression échouée)", "warning")
          setTimeout(() => {
            videoRecorder.resetRecording()
            setRecordingType(null)
          }, 100)
        }
      }
      
      processVideo()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRecorder.mediaBlob, videoRecorder.isRecording])

  // Nettoyer les enregistrements au démontage
  useEffect(() => {
    return () => {
      audioRecorder.cleanup()
      videoRecorder.cleanup()
      // Nettoyer les URLs créées pour les fichiers
      evidence.forEach((file) => {
        // Les URLs seront révoquées automatiquement quand les composants seront démontés
        // Mais on peut aussi les nettoyer ici si nécessaire
      })
    }
  }, [])
  
  // Nettoyer les URLs des fichiers quand ils sont supprimés
  useEffect(() => {
    return () => {
      // Les URLs seront révoquées quand les composants sont démontés
    }
  }, [evidence])

  const toggleNeed = (need: string) => {
    setNeeds((prev) => (prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]))
  }

  const handleOtherCrimesConfirm = () => {
    if (!otherCrimesDetails.trim()) {
      addToast("Veuillez préciser de quel type de crime il s'agit.", "error")
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
      addToast("Veuillez remplir tous les champs obligatoires", "error")
      return
    }
    
    // Vérifier que la date n'est pas future
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(23, 59, 59, 999) // Fin de la journée d'aujourd'hui
    
    if (selectedDate > today) {
      addToast("La date de l'incident ne peut pas être dans le futur. Veuillez sélectionner une date valide.", "error")
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
                    <Input 
                      id="date" 
                      type="date" 
                      value={date} 
                      onChange={(e) => {
                        const selectedDate = e.target.value
                        const today = new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
                        
                        // Empêcher la sélection de dates futures
                        if (selectedDate > today) {
                          addToast("La date de l'incident ne peut pas être dans le futur. Veuillez sélectionner une date valide.", "error")
                          return
                        }
                        
                        setDate(selectedDate)
                      }}
                      max={new Date().toISOString().split('T')[0]} // Limiter la sélection à aujourd'hui
                    />
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
              className={`gap-2 transition-all ${recordingType === 'audio' 
                ? 'border-destructive text-destructive bg-destructive/10 hover:bg-destructive/20 shadow-lg scale-105' 
                : 'bg-transparent hover:bg-accent'}`}
              onClick={handleAudioRecording}
              disabled={recordingType === 'video'}
            >
              {recordingType === 'audio' ? (
                <>
                  <StopCircle className="h-4 w-4 animate-pulse" />
                  Arrêter ({String(Math.floor(audioRecorder.duration / 60)).padStart(2, '0')}:{String(audioRecorder.duration % 60).padStart(2, '0')} / {String(Math.floor(audioRecorder.maxDuration / 60)).padStart(2, '0')}:{String(audioRecorder.maxDuration % 60).padStart(2, '0')})
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Enregistrer audio (max {String(Math.floor(audioRecorder.maxDuration / 60)).padStart(2, '0')}:{String(audioRecorder.maxDuration % 60).padStart(2, '0')})
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className={`gap-2 transition-all ${recordingType === 'video' 
                ? 'border-destructive text-destructive bg-destructive/10 hover:bg-destructive/20 shadow-lg scale-105' 
                : 'bg-transparent hover:bg-accent'}`}
              onClick={handleVideoRecording}
              disabled={recordingType === 'audio'}
            >
              {recordingType === 'video' ? (
                <>
                  <StopCircle className="h-4 w-4 animate-pulse" />
                  Arrêter ({String(Math.floor(videoRecorder.duration / 60)).padStart(2, '0')}:{String(videoRecorder.duration % 60).padStart(2, '0')} / {String(Math.floor(videoRecorder.maxDuration / 60)).padStart(2, '0')}:{String(videoRecorder.maxDuration % 60).padStart(2, '0')})
                </>
              ) : (
                <>
                  <Video className="h-4 w-4" />
                  Enregistrer vidéo (max {String(Math.floor(videoRecorder.maxDuration / 60)).padStart(2, '0')}:{String(videoRecorder.maxDuration % 60).padStart(2, '0')})
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
            <div className="relative w-full aspect-video bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border-2 border-destructive shadow-2xl">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }} // Miroir pour selfie
              />
              {!videoRecorder.stream && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 border-4 border-destructive border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-white text-sm font-medium">Initialisation de la caméra...</p>
                  </div>
                </div>
              )}
              {/* Chrono et barre de progression */}
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <div className="flex justify-end">
                  <div className="bg-destructive/95 backdrop-blur-md text-destructive-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-xl border border-destructive-foreground/20">
                    <div className="w-3 h-3 bg-destructive-foreground rounded-full animate-pulse" />
                    <span className="tabular-nums">
                      {String(Math.floor(videoRecorder.duration / 60)).padStart(2, '0')}:
                      {String(videoRecorder.duration % 60).padStart(2, '0')} / 
                      {String(Math.floor(videoRecorder.maxDuration / 60)).padStart(2, '0')}:
                      {String(videoRecorder.maxDuration % 60).padStart(2, '0')}
                    </span>
                  </div>
                </div>
                {/* Barre de progression en bas */}
                <div className="w-full bg-black/50 backdrop-blur-sm rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-destructive to-red-600 transition-all duration-300 ease-linear"
                    style={{ width: `${(videoRecorder.duration / videoRecorder.maxDuration) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Indicateur audio pendant l'enregistrement */}
          {recordingType === 'audio' && audioRecorder.isRecording && (
            <div className="relative w-full bg-gradient-to-br from-destructive/10 to-red-500/10 rounded-xl overflow-hidden border-2 border-destructive p-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-destructive/20 flex items-center justify-center">
                    <Mic className="h-12 w-12 text-destructive animate-pulse" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-destructive animate-ping opacity-75" />
                </div>
                <div className="text-center space-y-2">
                  <div className="bg-destructive/95 backdrop-blur-md text-destructive-foreground px-4 py-2 rounded-lg text-lg font-bold inline-flex items-center gap-2 shadow-xl">
                    <div className="w-3 h-3 bg-destructive-foreground rounded-full animate-pulse" />
                    <span className="tabular-nums">
                      {String(Math.floor(audioRecorder.duration / 60)).padStart(2, '0')}:
                      {String(audioRecorder.duration % 60).padStart(2, '0')} / 
                      {String(Math.floor(audioRecorder.maxDuration / 60)).padStart(2, '0')}:
                      {String(audioRecorder.maxDuration % 60).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Enregistrement en cours...</p>
                </div>
                {/* Barre de progression */}
                <div className="w-full max-w-md bg-black/20 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-destructive to-red-600 transition-all duration-300 ease-linear"
                    style={{ width: `${(audioRecorder.duration / audioRecorder.maxDuration) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Liste des enregistrements et fichiers */}
          {evidence.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                <span>{evidence.length} {evidence.length === 1 ? 'fichier ajouté' : 'fichiers ajoutés'}</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="grid gap-4">
                {evidence.map((file, index) => {
                  const isAudio = file.type.startsWith('audio/')
                  const isVideo = file.type.startsWith('video/')
                  const isImage = file.type.startsWith('image/')
                  const fileUrl = URL.createObjectURL(file)
                  
                  return (
                    <div 
                      key={`${file.name}-${index}`} 
                      className="group relative bg-gradient-to-br from-card to-card/50 rounded-xl border border-border/50 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                      {/* Header avec icône et actions */}
                      <div className="flex items-center justify-between p-4 bg-muted/30 border-b border-border/50">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                            isAudio ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                            isVideo ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' :
                            'bg-green-500/20 text-green-600 dark:text-green-400'
                          }`}>
                            {isAudio ? <FileAudio className="h-5 w-5" /> :
                             isVideo ? <FileVideo className="h-5 w-5" /> :
                             <ImageIcon className="h-5 w-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[1]?.toUpperCase() || 'Fichier'}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            URL.revokeObjectURL(fileUrl)
                            removeFile(index)
                          }}
                          className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Contenu média */}
                      <div className="p-4">
                        {isImage && (
                          <div className="relative w-full rounded-lg overflow-hidden border border-border/50 bg-muted/20 group-hover:border-border transition-colors">
                            <img 
                              src={fileUrl} 
                              alt={file.name}
                              className="w-full h-auto max-h-80 object-contain"
                              onLoad={() => URL.revokeObjectURL(fileUrl)}
                            />
                          </div>
                        )}
                        
                        {isAudio && (
                          <div className="space-y-4">
                            {/* Design moderne pour l'audio */}
                            <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50 shadow-inner">
                              {/* Waveform visuel (décoratif) */}
                              <div className="absolute inset-0 opacity-10 dark:opacity-5">
                                <div className="flex items-end justify-center gap-1 h-full px-4 pb-4">
                                  {[...Array(20)].map((_, i) => (
                                    <div
                                      key={i}
                                      className="w-1 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"
                                      style={{
                                        height: `${Math.random() * 40 + 20}%`,
                                        animationDelay: `${i * 0.1}s`,
                                        animationDuration: `${0.5 + Math.random() * 0.5}s`
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                              
                              {/* Conteneur du lecteur audio */}
                              <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Mic className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground">Enregistrement audio</p>
                                    <p className="text-xs text-muted-foreground">Prêt à être écouté</p>
                                  </div>
                                </div>
                                
                                {/* Lecteur audio personnalisé */}
                                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-sm">
                                  <audio
                                    src={fileUrl}
                                    controls
                                    className="w-full h-10 [&::-webkit-media-controls-panel]:bg-transparent [&::-webkit-media-controls-play-button]:bg-blue-500 [&::-webkit-media-controls-play-button]:rounded-full"
                                    preload="metadata"
                                    onLoadedMetadata={() => {
                                      // URL sera révoquée quand le composant sera démonté
                                    }}
                                  />
                                </div>
                                
                                {/* Indicateur visuel */}
                                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    <span>Enregistrement prêt</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {isVideo && (
                          <div className="space-y-4">
                            {/* Design moderne pour la vidéo */}
                            <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-red-950/30 rounded-xl p-6 border border-purple-200/50 dark:border-purple-800/50 shadow-inner overflow-hidden">
                              {/* Effet de lumière animé en arrière-plan */}
                              <div className="absolute inset-0 opacity-10 dark:opacity-5">
                                <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-400 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
                                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-400 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                              </div>
                              
                              {/* Conteneur du lecteur vidéo */}
                              <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                                    <Video className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground">Enregistrement vidéo</p>
                                    <p className="text-xs text-muted-foreground">Prêt à être visionné</p>
                                  </div>
                                </div>
                                
                                {/* Lecteur vidéo avec design amélioré */}
                                <div className="relative rounded-xl overflow-hidden border-2 border-purple-200/50 dark:border-purple-800/50 bg-black shadow-2xl group">
                                  {/* Overlay avec effet de brillance au survol */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
                                  
                                  {/* Lecteur vidéo */}
                                  <video
                                    src={fileUrl}
                                    controls
                                    className="w-full h-auto max-h-96 object-contain"
                                    preload="metadata"
                                    onLoadedMetadata={() => {
                                      // URL sera révoquée quand le composant sera démonté
                                    }}
                                  />
                                  
                                  {/* Indicateur de lecture en bas */}
                                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-0 group-hover:w-full transition-all duration-300" />
                                  </div>
                                </div>
                                
                                {/* Indicateur visuel */}
                                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                    <span>Vidéo prête</span>
                                  </div>
                                  <span className="text-muted-foreground/50">•</span>
                                  <span className="text-muted-foreground">Cliquez sur play pour visionner</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
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
