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

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }))

      // Obtenir les permissions média
      const constraints: MediaStreamConstraints = {
        audio: !videoOnly,
        video: !audioOnly ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        } : false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      // Créer le MediaRecorder
      const mimeType = getSupportedMimeType()
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: videoOnly ? 2500000 : undefined, // 2.5 Mbps pour la vidéo
        audioBitsPerSecond: audioOnly ? 128000 : undefined, // 128 kbps pour l'audio
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      // Gérer les événements
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
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
      mediaRecorder.start(1000) // Collecter les données toutes les secondes
      startTimeRef.current = Date.now()

      // Démarrer le timer
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        
        if (elapsed >= maxDuration) {
          stopRecording()
          return
        }

        setState(prev => ({ ...prev, duration: elapsed }))
      }, 1000)

      // Mettre à jour le state avec isRecording, stream et duration en une seule fois
      setState(prev => ({ ...prev, isRecording: true, duration: 0, stream }))

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du démarrage de l\'enregistrement'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isRecording: false,
      }))
    }
  }, [maxDuration, audioOnly, videoOnly])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop()
    }

    // Arrêter le stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
      setState(prev => ({ ...prev, stream: null })) // Mettre à jour le state
    }

    // Nettoyer le timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
      durationIntervalRef.current = null
    }
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
