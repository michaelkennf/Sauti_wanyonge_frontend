"use client"

import { useState, useEffect, useCallback } from 'react'
import Dexie from 'dexie'

// Configuration de la base de données IndexedDB
class OfflineDatabase extends Dexie {
  complaints!: Dexie.Table<OfflineComplaint, number>
  mediaFiles!: Dexie.Table<OfflineMediaFile, number>
  syncQueue!: Dexie.Table<SyncQueueItem, number>

  constructor() {
    super('SautiYaWayongeOffline')
    this.version(1).stores({
      complaints: '++id, investigatorId, createdAt, updatedAt, isSynced, syncStatus',
      mediaFiles: '++id, complaintId, fileName, fileType, fileData, createdAt, isSynced',
      syncQueue: '++id, type, data, createdAt, retryCount, status'
    })
  }
}

const db = new OfflineDatabase()

export interface OfflineComplaint {
  id?: number
  investigatorId: string
  investigatorName: string
  victimData: {
    isAnonymous: boolean
    name?: string
    phone?: string
    email?: string
  }
  incidentData: {
    type: string
    date: string
    location: string
    description: string
    geolocation?: GeolocationData
  }
  evidence: {
    audioFiles: string[]
    videoFiles: string[]
    imageFiles: string[]
    documentFiles: string[]
  }
  services: string[]
  investigatorComment: string
  createdAt: Date
  updatedAt: Date
  isSynced: boolean
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error'
  serverId?: string
}

export interface OfflineMediaFile {
  id?: number
  complaintId: number
  fileName: string
  fileType: 'audio' | 'video' | 'image' | 'document'
  fileData: Blob
  createdAt: Date
  isSynced: boolean
}

export interface SyncQueueItem {
  id?: number
  type: 'complaint' | 'media'
  data: any
  createdAt: Date
  retryCount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

export interface GeolocationData {
  latitude: number
  longitude: number
  country: string
  province: string
  zone: string
  address: string
  accuracy: number
}

export interface OfflineSyncState {
  isOnline: boolean
  isSyncing: boolean
  pendingItems: number
  lastSyncTime: Date | null
  error: string | null
}

export function useOfflineSync() {
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: typeof window !== 'undefined' && typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingItems: 0,
    lastSyncTime: null,
    error: null,
  })

  // Surveiller l'état de la connexion
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true, error: null }))
      // Déclencher la synchronisation automatique
      syncPendingItems()
    }

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }))
    }

    // Initialiser l'état de connexion et écouter les événements (uniquement côté client)
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      setState(prev => ({ ...prev, isOnline: navigator.onLine }))
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }

    // Vérifier les éléments en attente au démarrage
    checkPendingItems()

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  const checkPendingItems = useCallback(async () => {
    try {
      const pendingComplaints = await db.complaints.where('isSynced').equals(false).count()
      const pendingMedia = await db.mediaFiles.where('isSynced').equals(false).count()
      
      setState(prev => ({
        ...prev,
        pendingItems: pendingComplaints + pendingMedia,
      }))
    } catch (error) {
      console.error('Erreur lors de la vérification des éléments en attente:', error)
    }
  }, [])

  const saveComplaintOffline = useCallback(async (complaintData: Omit<OfflineComplaint, 'id' | 'createdAt' | 'updatedAt' | 'isSynced' | 'syncStatus'>) => {
    try {
      const complaint: OfflineComplaint = {
        ...complaintData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSynced: false,
        syncStatus: 'pending',
      }

      const id = await db.complaints.add(complaint)
      
      // Ajouter à la file de synchronisation
      await db.syncQueue.add({
        type: 'complaint',
        data: { ...complaint, id },
        createdAt: new Date(),
        retryCount: 0,
        status: 'pending',
      })

      await checkPendingItems()
      return id
    } catch (error) {
      console.error('Erreur lors de la sauvegarde hors ligne:', error)
      throw error
    }
  }, [checkPendingItems])

  const saveMediaFileOffline = useCallback(async (mediaData: Omit<OfflineMediaFile, 'id' | 'createdAt' | 'isSynced'>) => {
    try {
      const mediaFile: OfflineMediaFile = {
        ...mediaData,
        createdAt: new Date(),
        isSynced: false,
      }

      const id = await db.mediaFiles.add(mediaFile)
      
      // Ajouter à la file de synchronisation
      await db.syncQueue.add({
        type: 'media',
        data: { ...mediaFile, id },
        createdAt: new Date(),
        retryCount: 0,
        status: 'pending',
      })

      await checkPendingItems()
      return id
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du fichier média:', error)
      throw error
    }
  }, [checkPendingItems])

  const syncPendingItems = useCallback(async () => {
    if (!state.isOnline || state.isSyncing) return

    setState(prev => ({ ...prev, isSyncing: true, error: null }))

    try {
      // Synchroniser les plaintes
      const pendingComplaints = await db.complaints.where('isSynced').equals(false).toArray()
      
      for (const complaint of pendingComplaints) {
        try {
          await db.complaints.update(complaint.id!, { syncStatus: 'syncing' })
          
          const response = await fetch('/api/plaintes/offline-sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              complaint: complaint,
              investigatorId: complaint.investigatorId,
            }),
          })

          if (response.ok) {
            const result = await response.json()
            await db.complaints.update(complaint.id!, {
              isSynced: true,
              syncStatus: 'synced',
              serverId: result.serverId,
            })
          } else {
            throw new Error(`Erreur de synchronisation: ${response.statusText}`)
          }
        } catch (error) {
          console.error('Erreur lors de la synchronisation de la plainte:', error)
          await db.complaints.update(complaint.id!, { syncStatus: 'error' })
        }
      }

      // Synchroniser les fichiers média
      const pendingMedia = await db.mediaFiles.where('isSynced').equals(false).toArray()
      
      for (const mediaFile of pendingMedia) {
        try {
          // Obtenir l'URL de téléchargement pré-signée
          const presignResponse = await fetch('/api/uploads/presign', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileName: mediaFile.fileName,
              fileType: mediaFile.fileType,
            }),
          })

          if (presignResponse.ok) {
            const { uploadUrl } = await presignResponse.json()
            
            // Télécharger le fichier
            const uploadResponse = await fetch(uploadUrl, {
              method: 'PUT',
              body: mediaFile.fileData,
              headers: {
                'Content-Type': mediaFile.fileType === 'image' ? 'image/jpeg' : 'application/octet-stream',
              },
            })

            if (uploadResponse.ok) {
              await db.mediaFiles.update(mediaFile.id!, { isSynced: true })
            } else {
              throw new Error('Erreur lors du téléchargement du fichier')
            }
          } else {
            throw new Error('Erreur lors de l\'obtention de l\'URL de téléchargement')
          }
        } catch (error) {
          console.error('Erreur lors de la synchronisation du fichier média:', error)
        }
      }

      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date(),
        pendingItems: 0,
      }))

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de synchronisation'
      setState(prev => ({
        ...prev,
        isSyncing: false,
        error: errorMessage,
      }))
    }
  }, [state.isOnline, state.isSyncing])

  const getOfflineComplaints = useCallback(async () => {
    try {
      return await db.complaints.orderBy('createdAt').reverse().toArray()
    } catch (error) {
      console.error('Erreur lors de la récupération des plaintes hors ligne:', error)
      return []
    }
  }, [])

  const getOfflineMediaFiles = useCallback(async (complaintId: number) => {
    try {
      return await db.mediaFiles.where('complaintId').equals(complaintId).toArray()
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers média:', error)
      return []
    }
  }, [])

  const clearSyncedData = useCallback(async () => {
    try {
      await db.complaints.where('isSynced').equals(true).delete()
      await db.mediaFiles.where('isSynced').equals(true).delete()
      await db.syncQueue.where('status').equals('completed').delete()
      
      await checkPendingItems()
    } catch (error) {
      console.error('Erreur lors du nettoyage des données synchronisées:', error)
    }
  }, [checkPendingItems])

  return {
    ...state,
    saveComplaintOffline,
    saveMediaFileOffline,
    syncPendingItems,
    getOfflineComplaints,
    getOfflineMediaFiles,
    clearSyncedData,
    checkPendingItems,
  }
}
