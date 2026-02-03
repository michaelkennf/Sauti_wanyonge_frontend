"use client"

import { useState, useRef, useCallback } from 'react'

export interface MediaRecorderState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  maxDuration: number
  mediaBlob: Blob | null
  error: string | null
  stream: MediaStream | null // Exposer le stream pour le preview
}

export interface MediaRecorderOptions {
  maxDuration?: number // en secondes
  audioOnly?: boolean
  videoOnly?: boolean
}

export function useMediaRecorder(options: MediaRecorderOptions = {}) {
  const {
    maxDuration = 35, // 35 secondes par défaut
    audioOnly = false,
    videoOnly = false,
  } = options

  const [state, setState] = useState<MediaRecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    maxDuration,
    mediaBlob: null,
    error: null,
    stream: null,
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const stopRecordingRef = useRef<(() => void) | null>(null)

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }))

      // Obtenir les permissions média
      // Logique simplifiée :
      // - audioOnly: true → seulement audio (video: false, audio: true)
      // - videoOnly: true → seulement vidéo sans audio (video: true, audio: false) - rare
      // - videoOnly: false et audioOnly: false → audio + vidéo (video: true, audio: true) - cas normal pour vidéo
      const wantsAudio = audioOnly || (!videoOnly && !audioOnly)
      const wantsVideo = !audioOnly
      
      const constraints: MediaStreamConstraints = {
        audio: wantsAudio,
        video: wantsVideo ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        } : false,
      }

      console.log('📹 Demande d\'accès aux médias:', {
        audioOnly,
        videoOnly,
        wantsAudio,
        wantsVideo,
        constraints: JSON.stringify(constraints)
      })
      
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
        console.log('✅ Stream obtenu avec succès')
      } catch (mediaError: any) {
        console.error('❌ Erreur getUserMedia:', {
          name: mediaError?.name,
          message: mediaError?.message,
          constraint: mediaError?.constraint,
          error: mediaError
        })
        throw mediaError
      }
      console.log('✅ Stream obtenu:', { 
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
        active: stream.active
      })
      streamRef.current = stream

      // Créer le MediaRecorder
      const mimeType = getSupportedMimeType()
      console.log('🎥 Création du MediaRecorder avec mimeType:', mimeType)
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        // Bitrate optimisé : qualité excellente avec taille réduite
        videoBitsPerSecond: videoOnly ? 1800000 : undefined, // 1.8 Mbps pour la vidéo (excellente qualité 720p)
        audioBitsPerSecond: audioOnly ? 96000 : undefined, // 96 kbps pour l'audio (qualité très bonne, transparente pour la voix)
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      console.log('✅ MediaRecorder créé:', { state: mediaRecorder.state })

      // Gérer les événements
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        
        // Arrêter le stream APRÈS avoir créé le blob
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        
        setState(prev => ({
          ...prev,
          mediaBlob: blob,
          isRecording: false,
          isPaused: false,
          stream: null, // Nettoyer le stream après l'enregistrement
        }))
        
        // Nettoyer les références
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current)
          durationIntervalRef.current = null
        }
      }

      mediaRecorder.onerror = (event) => {
        setState(prev => ({
          ...prev,
          error: `Erreur d'enregistrement: ${event}`,
          isRecording: false,
          stream: null,
        }))
      }

      // Démarrer l'enregistrement
      console.log('▶️ Démarrage du MediaRecorder...')
      mediaRecorder.start(1000) // Collecter les données toutes les secondes
      startTimeRef.current = Date.now()
      console.log('✅ MediaRecorder démarré:', { state: mediaRecorder.state })

      // Mettre à jour le state avec isRecording, stream et duration en une seule fois
      // IMPORTANT: Créer un nouvel objet pour forcer React à détecter le changement
      const newState = {
        isRecording: true,
        isPaused: false,
        duration: 0,
        maxDuration,
        mediaBlob: null,
        error: null,
        stream: stream, // Le stream doit être dans le state pour le preview
      }
      console.log('📊 Mise à jour du state avec nouvel objet:', { 
        isRecording: newState.isRecording, 
        duration: newState.duration, 
        hasStream: !!newState.stream,
        streamId: newState.stream?.id
      })
      setState(newState)

      // Démarrer le timer APRÈS avoir mis à jour le state
      // Utiliser une fonction locale pour éviter les problèmes de closure
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        
        if (elapsed >= maxDuration) {
          // Arrêter le MediaRecorder directement pour éviter les problèmes de closure
          if (mediaRecorderRef.current && (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused')) {
            try {
              mediaRecorderRef.current.stop()
            } catch (error) {
              console.error('Erreur lors de l\'arrêt automatique:', error)
            }
          }
          // Nettoyer le timer
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current)
            durationIntervalRef.current = null
          }
          return
        }

        // Toujours mettre à jour pour que React détecte le changement
        setState(prev => {
          // Forcer la mise à jour même si la valeur est la même pour le premier tick
          if (prev.duration !== elapsed || elapsed === 0) {
            console.log('⏱️ Mise à jour durée:', elapsed)
            return { ...prev, duration: elapsed }
          }
          return prev
        })
      }, 1000)
      
      console.log('⏱️ Timer démarré pour la durée, interval ID:', durationIntervalRef.current)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du démarrage de l\'enregistrement'
      console.error('❌ Erreur dans startRecording:', error)
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isRecording: false,
        stream: null,
      }))
      // Réinitialiser les refs en cas d'erreur
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }
    }
  }, [maxDuration, audioOnly, videoOnly])

  const stopRecording = useCallback(() => {
    // Arrêter le MediaRecorder - le stream sera arrêté dans onstop après création du blob
    if (mediaRecorderRef.current && state.isRecording) {
      try {
        // Vérifier que le MediaRecorder est dans un état valide
        if (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused') {
          mediaRecorderRef.current.stop()
        }
      } catch (error) {
        console.error('Erreur lors de l\'arrêt de l\'enregistrement:', error)
        // Forcer l'arrêt du stream en cas d'erreur
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        setState(prev => ({
          ...prev,
          isRecording: false,
          stream: null,
          error: error instanceof Error ? error.message : 'Erreur lors de l\'arrêt de l\'enregistrement'
        }))
      }
    }

    // Nettoyer le timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
      durationIntervalRef.current = null
    }
    
    // Note: Le stream sera arrêté dans onstop après création du blob
    // pour éviter les problèmes de race condition
  }, [state.isRecording])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
      mediaRecorderRef.current.pause()
      setState(prev => ({ ...prev, isPaused: true }))
    }
  }, [state.isRecording, state.isPaused])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && state.isPaused) {
      mediaRecorderRef.current.resume()
      setState(prev => ({ ...prev, isPaused: false }))
    }
  }, [state.isRecording, state.isPaused])

  const resetRecording = useCallback(() => {
    stopRecording()
    setState(prev => ({
      ...prev,
      duration: 0,
      mediaBlob: null,
      error: null,
      stream: null,
    }))
    chunksRef.current = []
  }, [stopRecording])

  const getRecordingUrl = useCallback(() => {
    if (state.mediaBlob) {
      return URL.createObjectURL(state.mediaBlob)
    }
    return null
  }, [state.mediaBlob])

  const downloadRecording = useCallback((filename?: string) => {
    if (state.mediaBlob) {
      const url = URL.createObjectURL(state.mediaBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || `enregistrement_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${audioOnly ? 'webm' : 'mp4'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }, [state.mediaBlob, audioOnly])

  // Fonction utilitaire pour obtenir le type MIME supporté
  const getSupportedMimeType = useCallback(() => {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'video/mp4',
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return 'video/webm' // Fallback
  }, [])

  // Nettoyage lors du démontage
  const cleanup = useCallback(() => {
    stopRecording()
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
    }
  }, [stopRecording])

  // Mettre à jour la ref de stopRecording pour qu'elle soit accessible dans le timer
  stopRecordingRef.current = stopRecording

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    getRecordingUrl,
    downloadRecording,
    cleanup,
  }
}
