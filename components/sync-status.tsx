"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  RefreshCw
} from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

interface SyncStatusProps {
  isOnline: boolean
  pendingItems: number
  lastSync?: Date
  onSync?: () => void
  className?: string
}

export function SyncStatusComponent({ 
  isOnline, 
  pendingItems, 
  lastSync, 
  onSync,
  className = "" 
}: SyncStatusProps) {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Afficher le statut si hors ligne ou s'il y a des éléments en attente
    setIsVisible(!isOnline || pendingItems > 0)
  }, [isOnline, pendingItems])

  const getStatusColor = () => {
    if (!isOnline) return "destructive"
    if (pendingItems > 0) return "warning"
    return "default"
  }

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />
    if (pendingItems > 0) return <AlertCircle className="h-4 w-4" />
    return <CheckCircle2 className="h-4 w-4" />
  }

  const getStatusText = () => {
    if (!isOnline) return t('investigatorForm.offline')
    if (pendingItems > 0) return `${pendingItems} ${t('investigatorForm.syncPending')}`
    return t('investigatorForm.online')
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 ${className}`}
        >
          <Alert variant={getStatusColor()} className="shadow-lg border-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <AlertDescription className="font-medium">
                  {getStatusText()}
                </AlertDescription>
                {pendingItems > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {pendingItems}
                  </Badge>
                )}
              </div>
              
              {onSync && pendingItems > 0 && isOnline && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onSync}
                  className="h-8"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {t('common.refresh')}
                </Button>
              )}
            </div>
            
            {lastSync && (
              <div className="mt-2 text-xs text-muted-foreground">
                {t('common.lastSync')}: {lastSync.toLocaleString()}
              </div>
            )}
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook pour gérer le statut de synchronisation
export function useSyncStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingItems, setPendingItems] = useState(0)
  const [lastSync, setLastSync] = useState<Date | undefined>()

  useEffect(() => {
    // Écouter les changements de connectivité
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Initialiser l'état de connexion (uniquement côté client)
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine)
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  const syncData = async () => {
    if (!isOnline) return

    try {
      // Simuler la synchronisation
      setPendingItems(prev => Math.max(0, prev - 1))
      setLastSync(new Date())
    } catch (error) {
      console.error('Erreur de synchronisation:', error)
    }
  }

  const addPendingItem = () => {
    setPendingItems(prev => prev + 1)
  }

  const removePendingItem = () => {
    setPendingItems(prev => Math.max(0, prev - 1))
  }

  return {
    isOnline,
    pendingItems,
    lastSync,
    syncData,
    addPendingItem,
    removePendingItem
  }
}