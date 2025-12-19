"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Mic,
  Video,
  Camera,
  X,
  Play,
  Pause,
  Square,
  RotateCcw,
  Download,
  MapPin,
  Wifi,
  WifiOff,
  Fingerprint,
  Save,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  User,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  Home,
  Users,
  FileImage,
  FileAudio,
  LogOut,
  LayoutDashboard,
  FileVideo,
  FileText as FileTextIcon,
  Eye,
  EyeOff,
  Edit
} from "lucide-react"
import { BiometricManager } from "@/components/biometric-manager"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { logger } from "@/lib/logger"
import { apiService } from "@/lib/api"

// Types pour le formulaire
interface FormData {
  // Identité du bénéficiaire
  beneficiaryName: string
  beneficiarySex: string
  beneficiaryBirthDate: string
  beneficiaryAge: number | null // Calculé automatiquement
  beneficiaryTerritory: string
  beneficiaryGroupement: string
  beneficiaryVillage: string
  beneficiaryHouseholdSize: number | null
  beneficiaryCurrentAddress: string
  beneficiaryStatus: string
  beneficiaryNatureOfFacts: string
  
  // Informations de l'incident
  incidentType: string
  incidentDate: string
  incidentTime: string
  incidentDescription: string
  incidentAddress: string
  
  // Documentation des évidences
  idDocumentNumber: string
  idDocumentType: string
  beneficiaryPhoto: File | null
  beneficiaryAudio: Blob | null
  beneficiaryVideo: Blob | null
  beneficiaryFingerprint: string | null
  beneficiaryFaceScan: string | null
  
  // Commentaire enquêteur
  investigatorComment: string
  
  // Géolocalisation
  latitude: number
  longitude: number
  accuracy: number
}

interface EvidenceFile {
  id: string
  type: 'photo' | 'audio' | 'video' | 'document'
  file: File | Blob
  name: string
  size: number
  mimeType: string
  preview?: string
}

// Fonction pour calculer l'âge à partir de la date de naissance
function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age >= 0 ? age : null
}

export default function InvestigatorFormPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isBiometricRegistered, setIsBiometricRegistered] = useState(false)
  const [isBiometricVerified, setIsBiometricVerified] = useState(false)
  const [investigatorId] = useState("INV-001") // En production, récupérer depuis l'auth
  const [isOnline, setIsOnline] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordingType, setRecordingType] = useState<'audio' | 'video' | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([])
  const [showOtherStatusDialog, setShowOtherStatusDialog] = useState(false)
  const [otherStatusDetails, setOtherStatusDetails] = useState("")
  const [showOtherCrimesDialog, setShowOtherCrimesDialog] = useState(false)
  const [otherCrimesDetails, setOtherCrimesDetails] = useState("")
  const [lastBeneficiaryNatureOfFacts, setLastBeneficiaryNatureOfFacts] = useState("")
  const [isFinalBiometricValidated, setIsFinalBiometricValidated] = useState(false) // Validation biométrique finale pour soumission
  const [formData, setFormData] = useState<FormData>({
    beneficiaryName: "",
    beneficiarySex: "",
    beneficiaryBirthDate: "",
    beneficiaryAge: null,
    beneficiaryTerritory: "",
    beneficiaryGroupement: "",
    beneficiaryVillage: "",
    beneficiaryHouseholdSize: null,
    beneficiaryCurrentAddress: "",
    beneficiaryStatus: "",
    beneficiaryNatureOfFacts: "",
    incidentType: "",
    incidentDate: "",
    incidentTime: "",
    incidentDescription: "",
    incidentAddress: "",
    idDocumentNumber: "",
    idDocumentType: "",
    beneficiaryPhoto: null,
    beneficiaryAudio: null,
    beneficiaryVideo: null,
    beneficiaryFingerprint: null,
    beneficiaryFaceScan: null,
    investigatorComment: "",
    latitude: 0,
    longitude: 0,
    accuracy: 0
  })

  // Synchroniser automatiquement le type d'incident avec la nature des faits
  // Remplir automatiquement uniquement quand la nature des faits change (nouvelle sélection)
  useEffect(() => {
    if (formData.beneficiaryNatureOfFacts && formData.beneficiaryNatureOfFacts.trim() !== "") {
      // Remplir automatiquement seulement si la nature des faits a changé
      if (formData.beneficiaryNatureOfFacts !== lastBeneficiaryNatureOfFacts) {
        setFormData(prev => ({ ...prev, incidentType: formData.beneficiaryNatureOfFacts }))
        setLastBeneficiaryNatureOfFacts(formData.beneficiaryNatureOfFacts)
      }
    }
  }, [formData.beneficiaryNatureOfFacts, lastBeneficiaryNatureOfFacts])

  // Vérifier l'authentification au chargement
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Vérifier les différents types d'authentification
      const biometricVerified = localStorage.getItem('investigator_biometric_registered')
      const passwordAuthenticated = localStorage.getItem('investigator_password_authenticated')
      const bypassAuthenticated = localStorage.getItem('investigator_bypass_authenticated')
      
      if (biometricVerified) {
        setIsBiometricVerified(true)
        setIsBiometricRegistered(true)
      } else if (passwordAuthenticated) {
        setIsBiometricVerified(true)
        setIsBiometricRegistered(false)
      } else if (bypassAuthenticated) {
        setIsBiometricVerified(true)
        setIsBiometricRegistered(false)
      }
    }
  }, [])

  // Détection de la connexion
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Géolocalisation automatique
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }))
        },
        (error) => {
          logger.warn('Géolocalisation non disponible', error, 'FormulaireEnqueteur')
          // Valeurs par défaut pour Kinshasa si géolocalisation échoue
          setFormData(prev => ({
            ...prev,
            latitude: -4.4419,
            longitude: 15.2663,
            accuracy: 0
          }))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    } else {
      logger.warn('Géolocalisation non supportée par ce navigateur', undefined, 'FormulaireEnqueteur')
      // Valeurs par défaut pour Kinshasa
      setFormData(prev => ({
        ...prev,
        latitude: -4.4419,
        longitude: 15.2663,
        accuracy: 0
      }))
    }
  }, [])

  // Chronomètre d'enregistrement avec durées différentes selon le type
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isRecording) {
      const maxDuration = recordingType === 'audio' ? 60 : 30 // 60s pour audio, 30s pour vidéo
      
      interval = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          // Arrêt automatique selon le type
          if (newTime >= maxDuration) {
            // Arrêter l'enregistrement automatiquement
            setIsRecording(false)
            setRecordingType(null)
            return maxDuration
          }
          return newTime
        })
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRecording, recordingType])

  // Arrêt automatique du MediaRecorder selon la durée max
  useEffect(() => {
    if (isRecording && mediaRecorder && recordingType) {
      const maxDuration = recordingType === 'audio' ? 60 : 30
      if (recordingTime >= maxDuration) {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop()
        }
        if (recordingStream) {
          recordingStream.getTracks().forEach(track => track.stop())
        }
        setMediaRecorder(null)
        setRecordingStream(null)
      }
    }
  }, [recordingTime, isRecording, mediaRecorder, recordingStream, recordingType])


  const steps = [
    { id: 1, title: "Identité du bénéficiaire", icon: User, color: "bg-blue-500" },
    { id: 2, title: "Informations de l'incident", icon: AlertCircle, color: "bg-red-500" },
    { id: 3, title: "Documentation des évidences", icon: Camera, color: "bg-purple-500" },
    { id: 4, title: "Commentaire enquêteur", icon: FileText, color: "bg-green-500" },
    { id: 5, title: "Validation finale", icon: Shield, color: "bg-orange-500" }
  ]

  // Fonctions pour la gestion des fichiers
  const handleFileUpload = (file: File, type: 'photo' | 'document') => {
    const newFile: EvidenceFile = {
      id: Date.now().toString(),
      type,
      file,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      preview: type === 'photo' ? URL.createObjectURL(file) : undefined
    }
    
    setEvidenceFiles(prev => [...prev, newFile])
    
    if (type === 'photo') {
      setFormData(prev => ({ ...prev, beneficiaryPhoto: file }))
    }
    
    toast({
      title: "Fichier ajouté",
      description: `${file.name} a été ajouté avec succès`,
    })
  }

  const removeFile = (fileId: string) => {
    setEvidenceFiles(prev => prev.filter(file => file.id !== fileId))
  }

  // Fonctions pour la capture biométrique du bénéficiaire
  const captureFingerprint = async () => {
    try {
      toast({
        title: "Capture en cours",
        description: "Placez votre doigt sur le capteur...",
      })
      
      // Simulation de la capture d'empreintes
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Générer un identifiant unique pour l'empreinte
      const fingerprintId = `fingerprint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      setFormData(prev => ({ ...prev, beneficiaryFingerprint: fingerprintId }))
      
      toast({
        title: "Empreintes capturées",
        description: "Les empreintes digitales ont été enregistrées avec succès",
      })
    } catch (error) {
      toast({
        title: "Erreur de capture",
        description: "Impossible de capturer les empreintes digitales",
        variant: "destructive"
      })
    }
  }

  const captureFaceScan = async () => {
    try {
      toast({
        title: "Scan en cours",
        description: "Positionnez votre visage devant la caméra...",
      })
      
      // Simulation du scan facial
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Générer un identifiant unique pour le scan facial
      const faceScanId = `facescan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      setFormData(prev => ({ ...prev, beneficiaryFaceScan: faceScanId }))
      
      toast({
        title: "Scan facial effectué",
        description: "Le scan facial a été enregistré avec succès",
      })
    } catch (error) {
      toast({
        title: "Erreur de scan",
        description: "Impossible d'effectuer le scan facial",
        variant: "destructive"
      })
    }
  }

  // Fonctions pour l'enregistrement audio/vidéo
  const startRecording = async (type: 'audio' | 'video') => {
    try {
      // Arrêter tout enregistrement en cours
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        stopRecording()
      }
      
      // Demander les permissions appropriées
      const constraints: MediaStreamConstraints = {
        audio: true, // Toujours demander l'audio
        video: type === 'video' // Vidéo seulement si demandé
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      const recorder = new MediaRecorder(stream, {
        mimeType: type === 'audio' ? 'audio/webm' : 'video/webm'
      })
      
      const chunks: BlobPart[] = []
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { 
          type: type === 'audio' ? 'audio/webm' : 'video/webm' 
        })
        
        const newFile: EvidenceFile = {
          id: Date.now().toString(),
          type,
          file: blob,
          name: `${type}_${Date.now()}.webm`,
          size: blob.size,
          mimeType: blob.type
        }
        
        setEvidenceFiles(prev => [...prev, newFile])
        
        if (type === 'audio') {
          setFormData(prev => ({ ...prev, beneficiaryAudio: blob }))
        } else {
          setFormData(prev => ({ ...prev, beneficiaryVideo: blob }))
        }
        
        // Nettoyer les ressources
        stream.getTracks().forEach(track => track.stop())
        setMediaRecorder(null)
        setRecordingStream(null)
        
        toast({
          title: "Enregistrement terminé",
          description: `${type === 'audio' ? 'Audio' : 'Vidéo'} enregistré avec succès (${recordingTime}s)`,
        })
      }
      
      recorder.onerror = (event) => {
        logger.error('Erreur MediaRecorder', event, 'FormulaireEnqueteur')
        toast({
          title: "Erreur d'enregistrement",
          description: "Une erreur est survenue pendant l'enregistrement",
          variant: "destructive"
        })
        stopRecording()
      }
      
      // Démarrer l'enregistrement
      recorder.start(1000) // Collecter les données toutes les secondes
      setMediaRecorder(recorder)
      setRecordingStream(stream)
      setRecordingType(type)
      setIsRecording(true)
      setRecordingTime(0)
      
    } catch (error) {
      logger.error('Erreur getUserMedia', error, 'FormulaireEnqueteur')
      toast({
        title: "Erreur d'accès",
        description: `Impossible d'accéder au ${type === 'audio' ? 'microphone' : 'microphone/caméra'}`,
        variant: "destructive"
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
    }
    
    if (recordingStream) {
      recordingStream.getTracks().forEach(track => track.stop())
    }
    
    setIsRecording(false)
    setRecordingType(null)
    setMediaRecorder(null)
    setRecordingStream(null)
  }

  const handleSubmit = async () => {
    if (!isBiometricVerified) {
      toast({
        title: "Vérification requise",
        description: "Vous devez vérifier votre identité avant de soumettre",
        variant: "destructive"
      })
      return
    }

    if (!isFinalBiometricValidated) {
      toast({
        title: "Validation finale requise",
        description: "Vous devez valider avec votre empreinte biométrique avant de soumettre",
        variant: "destructive"
      })
      return
    }

    // Vérifier que la date de naissance est renseignée et calculer l'âge si nécessaire
    if (!formData.beneficiaryBirthDate) {
      toast({
        title: "Date de naissance requise",
        description: "Veuillez renseigner la date de naissance du bénéficiaire",
        variant: "destructive"
      })
      return
    }

    // Recalculer l'âge au moment de la soumission pour s'assurer qu'il est à jour
    const calculatedAge = calculateAge(formData.beneficiaryBirthDate)
    if (calculatedAge === null || calculatedAge < 0) {
      toast({
        title: "Date de naissance invalide",
        description: "La date de naissance doit être dans le passé",
        variant: "destructive"
      })
      return
    }

    // Mettre à jour l'âge dans le formulaire
    setFormData(prev => ({ ...prev, beneficiaryAge: calculatedAge }))

    // Vérifier qu'au moins un scan biométrique est effectué (empreintes OU facial)
    if (!formData.beneficiaryFingerprint && !formData.beneficiaryFaceScan) {
      toast({
        title: "Capture biométrique requise",
        description: "Vous devez capturer au moins les empreintes digitales ou effectuer un scan facial du bénéficiaire",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      // Vérifier les empreintes biométriques du bénéficiaire avant soumission
      if (formData.beneficiaryFingerprint || formData.beneficiaryFaceScan) {
        try {
          const biometricCheck = await apiService.checkBiometric(
            formData.beneficiaryFingerprint || undefined,
            formData.beneficiaryFaceScan || undefined
          )
          
          if (biometricCheck.exists && biometricCheck.lastComplaint) {
            toast({
              title: "Bénéficiaire déjà enregistré",
              description: `Ce bénéficiaire existe déjà dans le système. Dernier dossier: ${biometricCheck.lastComplaint.trackingCode}`,
              variant: "default",
              duration: 5000
            })
            // Continuer quand même la soumission
          }
        } catch (error) {
          logger.warn('Erreur lors de la vérification biométrique', error, 'InvestigatorForm')
          // Continuer la soumission même si la vérification échoue
        }
      }

      // Préparer les preuves pour l'upload
      const evidenceArray: Array<{
        type: string
        fileName: string
        fileData?: string
        mimeType: string
        isRequired: boolean
      }> = []

      // Convertir les Blobs en File et uploader tous les fichiers
      const filesToUpload: File[] = []
      const fileMetadata: Array<{type: string, isRequired: boolean, originalName: string}> = []

      // Photo du bénéficiaire
      if (formData.beneficiaryPhoto) {
        filesToUpload.push(formData.beneficiaryPhoto)
        fileMetadata.push({
          type: 'PHOTO',
          isRequired: true,
          originalName: formData.beneficiaryPhoto.name
        })
      }

      // Audio (convertir Blob en File)
      if (formData.beneficiaryAudio) {
        const audioFile = new File([formData.beneficiaryAudio], `audio_${Date.now()}.webm`, {
          type: 'audio/webm'
        })
        filesToUpload.push(audioFile)
        fileMetadata.push({
          type: 'AUDIO',
          isRequired: true,
          originalName: `audio_${Date.now()}.webm`
        })
      }

      // Vidéo (convertir Blob en File)
      if (formData.beneficiaryVideo) {
        const videoFile = new File([formData.beneficiaryVideo], `video_${Date.now()}.webm`, {
          type: 'video/webm'
        })
        filesToUpload.push(videoFile)
        fileMetadata.push({
          type: 'VIDEO',
          isRequired: true,
          originalName: `video_${Date.now()}.webm`
        })
      }

      // Autres fichiers de preuve
      for (const file of evidenceFiles) {
        const fileObj = file.file instanceof File ? file.file : new File([file.file], file.name, {
          type: file.mimeType
        })
        filesToUpload.push(fileObj)
        fileMetadata.push({
          type: file.type === 'photo' ? 'PHOTO' : file.type === 'audio' ? 'AUDIO' : file.type === 'video' ? 'VIDEO' : 'IDENTITY_DOCUMENT',
          isRequired: false,
          originalName: file.name
        })
      }

      // Uploader tous les fichiers
      let uploadedFiles: Array<{
        id: string
        originalName: string
        fileName: string
        filePath: string
        fileUrl: string
        mimeType: string
        size: number
        uploadedAt: string
      }> = []

      if (filesToUpload.length > 0) {
        try {
          toast({
            title: "Upload en cours...",
            description: `Upload de ${filesToUpload.length} fichier(s) en cours...`,
          })
          uploadedFiles = await apiService.uploadFiles(filesToUpload)
          toast({
            title: "Upload réussi",
            description: `${uploadedFiles.length} fichier(s) uploadé(s) avec succès`,
          })
        } catch (uploadError: any) {
          logger.error('Erreur lors de l\'upload des fichiers', uploadError, 'InvestigatorForm')
          toast({
            title: "Erreur d'upload",
            description: uploadError.message || "Erreur lors de l'upload des fichiers",
            variant: "destructive"
          })
          throw uploadError
        }
      }

      // Construire le tableau des preuves avec les fichiers uploadés
      for (let i = 0; i < uploadedFiles.length; i++) {
        const uploadedFile = uploadedFiles[i]
        const metadata = fileMetadata[i]
        evidenceArray.push({
          type: metadata.type as any,
          fileName: uploadedFile.originalName,
          filePath: uploadedFile.filePath, // Utiliser le chemin du fichier uploadé
          fileSize: uploadedFile.size,
          mimeType: uploadedFile.mimeType,
          isRequired: metadata.isRequired
        } as any) // Type assertion temporaire jusqu'à la mise à jour du type
      }

      // Préparer les données de la plainte
      const complaintData = {
        type: 'INVESTIGATOR_ASSISTED' as const,
        priority: 'HIGH' as const,
        beneficiaryData: {
          name: formData.beneficiaryName,
          sex: formData.beneficiarySex === 'M' ? 'MALE' as const : formData.beneficiarySex === 'F' ? 'FEMALE' as const : 'OTHER' as const,
          age: calculatedAge!,
          birthDate: formData.beneficiaryBirthDate,
          territory: formData.beneficiaryTerritory,
          groupement: formData.beneficiaryGroupement,
          village: formData.beneficiaryVillage,
          householdSize: formData.beneficiaryHouseholdSize || 1,
          currentAddress: formData.beneficiaryCurrentAddress,
          status: formData.beneficiaryStatus,
          natureOfFacts: formData.beneficiaryNatureOfFacts,
          fingerprint: formData.beneficiaryFingerprint || undefined,
          faceScan: formData.beneficiaryFaceScan || undefined,
          photo: formData.beneficiaryPhoto ? formData.beneficiaryPhoto.name : undefined
        },
        incidentData: {
          type: formData.incidentType,
          date: formData.incidentDate,
          time: formData.incidentTime,
          description: formData.incidentDescription,
          address: formData.incidentAddress
        },
        geolocation: {
          latitude: formData.latitude,
          longitude: formData.longitude,
          accuracy: formData.accuracy
        },
        evidence: evidenceArray,
        investigatorComment: formData.investigatorComment
      }

      // Soumettre la plainte
      const response = await apiService.createInvestigatorComplaint(complaintData)
      
      toast({
        title: "Formulaire soumis",
        description: `Le formulaire a été soumis avec succès. Code de suivi: ${response.trackingCode}`,
        duration: 5000
      })
      
      // Attendre un peu pour que l'utilisateur voie le message
      setTimeout(() => {
        router.push('/enqueteur/dashboard')
      }, 2000)
    } catch (error: any) {
      logger.error('Erreur lors de la soumission du formulaire', error, 'InvestigatorForm')
      toast({
        title: "Erreur de soumission",
        description: error.message || "Une erreur est survenue lors de la soumission",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const saveOffline = async () => {
    const offlineData = {
      formData,
      evidenceFiles,
      timestamp: new Date().toISOString(),
      investigatorId
    }
    
    localStorage.setItem('offline_form_data', JSON.stringify(offlineData))
    
    toast({
      title: "Sauvegardé hors ligne",
      description: "Les données seront synchronisées lors de la reconnexion",
    })
  }

  // Gestion du dialogue "Autre" pour le statut
  const handleOtherStatusConfirm = () => {
    if (!otherStatusDetails.trim()) {
      toast({
        title: "Champ requis",
        description: "Veuillez préciser le statut du bénéficiaire.",
        variant: "destructive"
      })
      return
    }
    setFormData(prev => ({ ...prev, beneficiaryStatus: `Autre: ${otherStatusDetails}` }))
    setShowOtherStatusDialog(false)
    setOtherStatusDetails("")
  }

  // Gestion du dialogue "Autres crimes graves" pour la nature des faits
  const handleOtherCrimesConfirm = () => {
    if (!otherCrimesDetails.trim()) {
      toast({
        title: "Champ requis",
        description: "Veuillez préciser de quel type de crime il s'agit.",
        variant: "destructive"
      })
      return
    }
    const natureValue = `Autres crimes graves: ${otherCrimesDetails}`
    setFormData(prev => ({ 
      ...prev, 
      beneficiaryNatureOfFacts: natureValue,
      incidentType: natureValue // Synchroniser aussi le type d'incident
    }))
    setShowOtherCrimesDialog(false)
    setOtherCrimesDetails("")
  }

  const handleClearOtherCrimes = () => {
    setOtherCrimesDetails("")
    setFormData(prev => ({ 
      ...prev, 
      beneficiaryNatureOfFacts: "",
      incidentType: ""
    }))
    setShowOtherCrimesDialog(false)
  }

  // Rendu des étapes
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="beneficiaryName">Nom complet du bénéficiaire *</Label>
          <Input
            id="beneficiaryName"
            value={formData.beneficiaryName}
            onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryName: e.target.value }))}
            placeholder="Nom et prénoms"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="beneficiarySex">Sexe *</Label>
          <Select value={formData.beneficiarySex} onValueChange={(value) => setFormData(prev => ({ ...prev, beneficiarySex: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner le sexe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Masculin</SelectItem>
              <SelectItem value="F">Féminin</SelectItem>
              <SelectItem value="O">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="beneficiaryBirthDate">Date de naissance *</Label>
          <Input
            id="beneficiaryBirthDate"
            type="date"
            value={formData.beneficiaryBirthDate}
            onChange={(e) => {
              const birthDate = e.target.value
              const age = calculateAge(birthDate)
              setFormData(prev => ({ 
                ...prev, 
                beneficiaryBirthDate: birthDate,
                beneficiaryAge: age
              }))
            }}
            max={new Date().toISOString().split('T')[0]}
            required
          />
          {formData.beneficiaryAge !== null && (
            <p className="text-sm text-muted-foreground">
              Âge calculé : {formData.beneficiaryAge} {formData.beneficiaryAge === 1 ? 'an' : 'ans'}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="beneficiaryHouseholdSize">Taille du ménage</Label>
          <Input
            id="beneficiaryHouseholdSize"
            type="number"
            value={formData.beneficiaryHouseholdSize || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryHouseholdSize: parseInt(e.target.value) || null }))}
            placeholder="Nombre de personnes"
            min="1"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Localisation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="beneficiaryTerritory">Territoire *</Label>
            <Select value={formData.beneficiaryTerritory} onValueChange={(value) => setFormData(prev => ({ ...prev, beneficiaryTerritory: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le territoire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gombe">Gombe</SelectItem>
                <SelectItem value="Limete">Limete</SelectItem>
                <SelectItem value="Kinshasa">Kinshasa</SelectItem>
                <SelectItem value="Lubumbashi">Lubumbashi</SelectItem>
                <SelectItem value="Goma">Goma</SelectItem>
                <SelectItem value="Bukavu">Bukavu</SelectItem>
                <SelectItem value="Kisangani">Kisangani</SelectItem>
                <SelectItem value="Kananga">Kananga</SelectItem>
                <SelectItem value="Mbujimayi">Mbujimayi</SelectItem>
                <SelectItem value="Kolwezi">Kolwezi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="beneficiaryGroupement">Groupement</Label>
            <Input
              id="beneficiaryGroupement"
              value={formData.beneficiaryGroupement}
              onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryGroupement: e.target.value }))}
              placeholder="Nom du groupement"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="beneficiaryVillage">Village</Label>
            <Input
              id="beneficiaryVillage"
              value={formData.beneficiaryVillage}
              onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryVillage: e.target.value }))}
              placeholder="Nom du village"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="beneficiaryCurrentAddress">Adresse actuelle *</Label>
        <Textarea
          id="beneficiaryCurrentAddress"
          value={formData.beneficiaryCurrentAddress}
          onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryCurrentAddress: e.target.value }))}
          placeholder="Adresse complète du bénéficiaire"
          rows={3}
          required
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Statut et nature des faits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="beneficiaryStatus">Statut du bénéficiaire *</Label>
            <Select 
              value={formData.beneficiaryStatus} 
              onValueChange={(value) => {
                if (value === "other") {
                  setShowOtherStatusDialog(true)
                } else {
                  setFormData(prev => ({ ...prev, beneficiaryStatus: value }))
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="victim">Victime</SelectItem>
                <SelectItem value="witness">Témoin</SelectItem>
                <SelectItem value="family">Famille</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="beneficiaryNatureOfFacts">Nature des faits *</Label>
            <Select 
              value={formData.beneficiaryNatureOfFacts} 
              onValueChange={(value) => {
                if (value === "Autres crimes graves") {
                  setShowOtherCrimesDialog(true)
                } else {
                  setFormData(prev => ({ ...prev, beneficiaryNatureOfFacts: value }))
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner la nature" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Viol">Viol</SelectItem>
                <SelectItem value="Harcèlement sexuel">Harcèlement sexuel</SelectItem>
                <SelectItem value="Zoophilie">Zoophilie</SelectItem>
                <SelectItem value="Mariage forcé">Mariage forcé</SelectItem>
                <SelectItem value="Proxénétisme">Proxénétisme</SelectItem>
                <SelectItem value="Attentat à la pudeur">Attentat à la pudeur</SelectItem>
                <SelectItem value="Autres crimes graves">Autres crimes graves</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="incidentType">Type d'incident *</Label>
          <Select 
            value={formData.incidentType} 
            onValueChange={(value) => {
              if (value === "Autres crimes graves") {
                setShowOtherCrimesDialog(true)
              } else {
                setFormData(prev => ({ ...prev, incidentType: value }))
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner le type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Viol">Viol</SelectItem>
              <SelectItem value="Harcèlement sexuel">Harcèlement sexuel</SelectItem>
              <SelectItem value="Zoophilie">Zoophilie</SelectItem>
              <SelectItem value="Mariage forcé">Mariage forcé</SelectItem>
              <SelectItem value="Proxénétisme">Proxénétisme</SelectItem>
              <SelectItem value="Attentat à la pudeur">Attentat à la pudeur</SelectItem>
              <SelectItem value="Autres crimes graves">Autres crimes graves</SelectItem>
            </SelectContent>
          </Select>
          {formData.beneficiaryNatureOfFacts && formData.incidentType === formData.beneficiaryNatureOfFacts && (
            <p className="text-sm text-muted-foreground">
              ✓ Rempli automatiquement depuis la nature des faits (modifiable si nécessaire)
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="incidentDate">Date de l'incident * (Année et mois requis, jour optionnel)</Label>
          <Input
            id="incidentDate"
            type="month"
            value={formData.incidentDate ? formData.incidentDate.substring(0, 7) : ""}
            onChange={(e) => setFormData(prev => ({ ...prev, incidentDate: e.target.value }))}
            required
          />
          <p className="text-xs text-muted-foreground">
            Sélectionnez au moins l'année et le mois. Le jour n'est pas obligatoire.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="incidentTime">Heure de l'incident</Label>
          <Input
            id="incidentTime"
            type="time"
            value={formData.incidentTime}
            onChange={(e) => setFormData(prev => ({ ...prev, incidentTime: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="incidentAddress">Lieu de l'incident *</Label>
          <Input
            id="incidentAddress"
            value={formData.incidentAddress}
            onChange={(e) => setFormData(prev => ({ ...prev, incidentAddress: e.target.value }))}
            placeholder="Adresse ou lieu précis"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="incidentDescription">Description détaillée de l'incident *</Label>
        <Textarea
          id="incidentDescription"
          value={formData.incidentDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, incidentDescription: e.target.value }))}
          placeholder="Décrivez en détail ce qui s'est passé..."
          rows={6}
          required
        />
      </div>

      {/* Géolocalisation */}
      <div className="space-y-2">
        <Label>Géolocalisation automatique</Label>
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">
            {formData.latitude !== 0 && formData.longitude !== 0 
              ? `Lat: ${formData.latitude.toFixed(6)}, Lng: ${formData.longitude.toFixed(6)}`
              : "Géolocalisation en cours..."
            }
          </span>
          <Badge variant="outline" className="ml-auto">
            Précision: {formData.accuracy > 0 ? `${Math.round(formData.accuracy)}m` : "N/A"}
          </Badge>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Document d'identité */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Document d'identité</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="idDocumentType">Type de document *</Label>
            <Select value={formData.idDocumentType} onValueChange={(value) => setFormData(prev => ({ ...prev, idDocumentType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="carte_identite">Carte d'identité</SelectItem>
                <SelectItem value="passeport">Passeport</SelectItem>
                <SelectItem value="permis_conduire">Permis de conduire</SelectItem>
                <SelectItem value="carte_etudiant">Carte d'étudiant</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="idDocumentNumber">Numéro du document</Label>
            <Input
              id="idDocumentNumber"
              value={formData.idDocumentNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, idDocumentNumber: e.target.value }))}
              placeholder="Numéro du document (optionnel)"
            />
          </div>
        </div>
      </div>

      {/* Photo obligatoire */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Photo du bénéficiaire *</h3>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Photo obligatoire pour l'enquêteur
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => document.getElementById('photo-upload')?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Choisir une photo
            </Button>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file, 'photo')
              }}
            />
          </div>
        </div>
        
        {/* Aperçu de la photo */}
        {formData.beneficiaryPhoto && (
          <div className="mt-4">
            <img
              src={URL.createObjectURL(formData.beneficiaryPhoto)}
              alt="Photo du bénéficiaire"
              className="w-32 h-32 object-cover rounded-lg border"
            />
          </div>
        )}
      </div>

      {/* Enregistrement audio/vidéo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Enregistrement audio/vidéo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Enregistrement audio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!isRecording ? (
                <Button 
                  onClick={() => startRecording('audio')} 
                  className="w-full"
                  variant="outline"
                  disabled={isRecording}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Enregistrer audio (max 1 min)
                </Button>
              ) : recordingType === 'audio' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Enregistrement audio...</span>
                  </div>
                  
                  {/* Chronomètre avec barre de progression */}
                  <div className="space-y-2">
                    <div className="text-center">
                      <span className="text-2xl font-mono font-bold text-red-600">
                        {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">/ 1:00</span>
                    </div>
                    
                    <Progress 
                      value={(recordingTime / 60) * 100} 
                      className="h-2"
                    />
                    
                    <div className="text-center text-xs text-muted-foreground">
                      {60 - recordingTime} secondes restantes
                    </div>
                  </div>
                  
                  <Button 
                    onClick={stopRecording} 
                    className="w-full"
                    variant="destructive"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Arrêter l'enregistrement
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <Mic className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Enregistrement vidéo en cours...</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Video className="h-4 w-4" />
                Enregistrement vidéo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!isRecording ? (
                <Button 
                  onClick={() => startRecording('video')} 
                  className="w-full"
                  variant="outline"
                  disabled={isRecording}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Enregistrer vidéo (max 30s)
                </Button>
              ) : recordingType === 'video' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Enregistrement vidéo...</span>
                  </div>
                  
                  {/* Chronomètre avec barre de progression */}
                  <div className="space-y-2">
                    <div className="text-center">
                      <span className="text-2xl font-mono font-bold text-red-600">
                        {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">/ 0:30</span>
                    </div>
                    
                    <Progress 
                      value={(recordingTime / 30) * 100} 
                      className="h-2"
                    />
                    
                    <div className="text-center text-xs text-muted-foreground">
                      {30 - recordingTime} secondes restantes
                    </div>
                  </div>
                  
                  <Button 
                    onClick={stopRecording} 
                    className="w-full"
                    variant="destructive"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Arrêter l'enregistrement
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <Video className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Enregistrement audio en cours...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Capture biométrique obligatoire */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Capture biométrique du bénéficiaire *</h3>
        <Alert>
          <Fingerprint className="h-4 w-4" />
          <AlertDescription>
            <strong>Obligatoire pour l'enquêteur :</strong> Capture des empreintes digitales ou scan facial du bénéficiaire
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Fingerprint className="h-4 w-4" />
                Empreintes digitales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                variant={formData.beneficiaryFingerprint ? "default" : "outline"}
                onClick={captureFingerprint}
              >
                <Fingerprint className="h-4 w-4 mr-2" />
                {formData.beneficiaryFingerprint ? "✓ Empreintes capturées" : "Capturer empreintes"}
              </Button>
              {formData.beneficiaryFingerprint && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  ✓ Capturé
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Scan facial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                variant={formData.beneficiaryFaceScan ? "default" : "outline"}
                onClick={captureFaceScan}
              >
                <Eye className="h-4 w-4 mr-2" />
                {formData.beneficiaryFaceScan ? "✓ Scan effectué" : "Scanner le visage"}
              </Button>
              {formData.beneficiaryFaceScan && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  ✓ Scanné
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fichiers ajoutés */}
      {evidenceFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Fichiers ajoutés</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evidenceFiles.map((file) => (
              <Card key={file.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded">
                      {file.type === 'photo' ? <FileImage className="h-4 w-4" /> :
                       file.type === 'audio' ? <FileAudio className="h-4 w-4" /> :
                       file.type === 'video' ? <FileVideo className="h-4 w-4" /> :
                       <FileTextIcon className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="investigatorComment">Commentaire / Résumé de l'enquêteur *</Label>
        <Textarea
          id="investigatorComment"
          value={formData.investigatorComment}
          onChange={(e) => setFormData(prev => ({ ...prev, investigatorComment: e.target.value }))}
          placeholder="Résumé de l'entretien, observations importantes, recommandations..."
          rows={8}
          required
        />
        <p className="text-sm text-muted-foreground">
          Ce champ est obligatoire et doit contenir un résumé détaillé de l'enquête
        </p>
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Récapitulatif :</strong> Vérifiez toutes les informations avant soumission
          {!isFinalBiometricValidated && (
            <span className="block mt-2 text-sm font-normal">
              Vous pouvez modifier les informations avant la validation biométrique finale.
            </span>
          )}
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Informations du bénéficiaire</h3>
          {!isFinalBiometricValidated && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(1)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Nom :</span> {formData.beneficiaryName}
          </div>
          <div>
            <span className="font-medium">Sexe :</span> {formData.beneficiarySex}
          </div>
          <div>
            <span className="font-medium">Date de naissance :</span> {formData.beneficiaryBirthDate ? new Date(formData.beneficiaryBirthDate).toLocaleDateString('fr-FR') : 'Non renseignée'}
          </div>
          <div>
            <span className="font-medium">Âge :</span> {formData.beneficiaryAge !== null ? `${formData.beneficiaryAge} ${formData.beneficiaryAge === 1 ? 'an' : 'ans'}` : 'Non calculé'}
          </div>
          <div>
            <span className="font-medium">Territoire :</span> {formData.beneficiaryTerritory}
          </div>
          <div>
            <span className="font-medium">Adresse :</span> {formData.beneficiaryCurrentAddress}
          </div>
          <div>
            <span className="font-medium">Statut :</span> {formData.beneficiaryStatus}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Incident</h3>
          {!isFinalBiometricValidated && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(2)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
          )}
        </div>
        <div className="text-sm space-y-1">
          <div><span className="font-medium">Type :</span> {formData.incidentType}</div>
          <div><span className="font-medium">Date :</span> {formData.incidentDate}</div>
          <div><span className="font-medium">Lieu :</span> {formData.incidentAddress}</div>
          <div><span className="font-medium">Description :</span> {formData.incidentDescription}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Preuves collectées</h3>
          {!isFinalBiometricValidated && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(3)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
          )}
        </div>
        <div className="text-sm">
          <div>• Photo du bénéficiaire : {formData.beneficiaryPhoto ? "✓ Ajoutée" : "✗ Manquante"}</div>
          <div>• Document d'identité : {formData.idDocumentNumber ? "✓ Renseigné" : "✗ Manquant"}</div>
          <div>• Enregistrement audio : {formData.beneficiaryAudio ? "✓ Ajouté" : "✗ Manquant"}</div>
          <div>• Enregistrement vidéo : {formData.beneficiaryVideo ? "✓ Ajouté" : "✗ Manquant"}</div>
          <div>• Capture biométrique : {formData.beneficiaryFingerprint || formData.beneficiaryFaceScan ? "✓ Effectuée" : "✗ Manquante"}</div>
          <div>• Commentaire enquêteur : {formData.investigatorComment ? "✓ Rédigé" : "✗ Manquant"}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Commentaire enquêteur</h3>
          {!isFinalBiometricValidated && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(4)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
          )}
        </div>
        <div className="text-sm p-3 bg-muted/50 rounded-lg">
          {formData.investigatorComment || "Aucun commentaire"}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Statut de connexion</h3>
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
            <span className="text-sm font-medium">
              {isOnline ? "En ligne" : "Hors ligne"}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground">Statut:</span>
            <Badge variant={isOnline ? "default" : "secondary"}>
              {isOnline ? "En ligne" : "Hors ligne"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Validation biométrique de l'enquêteur pour soumission */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Validation finale</h3>
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Dernière étape :</strong> Capture de vos empreintes pour valider la soumission
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Fingerprint className="h-12 w-12 mx-auto text-primary mb-4" />
            <h4 className="text-lg font-semibold mb-2">Validation biométrique</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Placez votre doigt sur le capteur pour valider la soumission
            </p>
            <Button 
              className="w-full" 
              size="lg" 
              onClick={async () => {
                // Simuler la validation biométrique
                toast({
                  title: "Validation biométrique",
                  description: "Vérification en cours...",
                })
                
                // Simuler un délai de validation
                await new Promise(resolve => setTimeout(resolve, 1500))
                
                // Marquer la validation comme effectuée
                setIsFinalBiometricValidated(true)
                
                toast({
                  title: "Validation réussie",
                  description: "Votre identité a été vérifiée. Vous pouvez maintenant soumettre le formulaire.",
                })
                
                // Ici, vous pouvez ajouter la logique de validation biométrique réelle
              }}
              disabled={isFinalBiometricValidated}
            >
              <Fingerprint className="h-4 w-4 mr-2" />
              {isFinalBiometricValidated ? "✓ Validé" : "Valider avec empreinte"}
            </Button>
            {isFinalBiometricValidated && (
              <Alert className="mt-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Validation effectuée :</strong> Les modifications ne sont plus possibles. Vous pouvez maintenant soumettre le formulaire.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5">
      {/* Vérification biométrique obligatoire */}
      {!isBiometricVerified && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <BiometricManager
              investigatorId={investigatorId}
              onBiometricComplete={setIsBiometricRegistered}
              onBiometricVerified={setIsBiometricVerified}
            />
          </div>
        </div>
      )}

      {/* Formulaire principal - affiché seulement après vérification biométrique */}
      {isBiometricVerified && (
        <>
          {/* Header avec statut de connexion */}
          <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-primary">Formulaire Enquêteur</h1>
                  <Badge variant={isOnline ? "default" : "destructive"} className="gap-2">
                    {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                    {isOnline ? "En ligne" : "Hors ligne"}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/enqueteur/dashboard')}
                    className="gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Tableau de bord
                  </Button>
                  <Badge variant="default" className="gap-2">
                    <CheckCircle2 className="h-3 w-3" />
                    Identité vérifiée
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const { logout: authLogout } = await import('@/lib/auth-helpers')
                      await authLogout()
                      router.push('/auth/investigator-login')
                    }}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              {/* Barre de progression */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Étape {currentStep} sur {steps.length}</h2>
                  <Badge variant="outline">
                    {Math.round((currentStep / steps.length) * 100)}% complété
                  </Badge>
                </div>
                <Progress value={(currentStep / steps.length) * 100} className="h-2" />
              </div>

              {/* Étapes */}
              <div className="grid grid-cols-5 gap-4 mb-8">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                      currentStep >= step.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-muted/30'
                    }`}
                  >
                    <div className={`p-3 rounded-full mb-2 text-white transition-all ${
                      currentStep >= step.id 
                        ? `${step.color} shadow-lg scale-110` 
                        : `${step.color} opacity-50`
                    }`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-center">{step.title}</span>
                  </div>
                ))}
              </div>

              {/* Contenu de l'étape actuelle */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {steps[currentStep - 1]?.title}
                  </CardTitle>
                  <CardDescription>
                    {currentStep === 1 && "Renseignez les informations du bénéficiaire"}
                    {currentStep === 2 && "Décrivez les détails de l'incident"}
                    {currentStep === 3 && "Ajoutez les preuves et documents"}
                    {currentStep === 4 && "Ajoutez votre commentaire d'enquêteur"}
                    {currentStep === 5 && "Vérifiez et soumettez le formulaire"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {currentStep === 1 && renderStep1()}
                      {currentStep === 2 && renderStep2()}
                      {currentStep === 3 && renderStep3()}
                      {currentStep === 4 && renderStep4()}
                      {currentStep === 5 && renderStep5()}
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Boutons de navigation */}
                  <div className="flex justify-between pt-6 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                      disabled={currentStep === 1 || (currentStep === 5 && isFinalBiometricValidated)}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Précédent
                    </Button>
                    
                    {currentStep < steps.length ? (
                      <Button 
                        onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                        className="gap-2"
                      >
                        Suivant
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !isFinalBiometricValidated}
                        className="gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Soumission...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            {isFinalBiometricValidated ? "Soumettre" : "Valider d'abord votre empreinte"}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Dialog pour "Autre" statut */}
      <Dialog open={showOtherStatusDialog} onOpenChange={setShowOtherStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Préciser le statut du bénéficiaire</DialogTitle>
            <DialogDescription>
              Veuillez préciser quel est le statut du bénéficiaire.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otherStatusDetails">
                Statut <span className="text-destructive">*</span>
              </Label>
              <Input
                id="otherStatusDetails"
                placeholder="Ex: Représentant légal, Organisation, etc."
                value={otherStatusDetails}
                onChange={(e) => setOtherStatusDetails(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowOtherStatusDialog(false)
                setOtherStatusDetails("")
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleOtherStatusConfirm}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </div>
  )
}