// Helper pour gérer les erreurs API de manière cohérente
import { ApiError, NetworkError, TimeoutError } from './api'
import { toast } from '@/components/ui/use-toast'

/**
 * Convertit une erreur API en message utilisateur lisible
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    // Messages spécifiques selon le code d'erreur
    switch (error.code) {
      case 'SESSION_EXPIRED':
      case 'NO_REFRESH_TOKEN':
        return 'Votre session a expiré. Veuillez vous reconnecter.'
      case 'VALIDATION_ERROR':
        return error.details?.errors?.[0]?.message || 'Données invalides'
      case 'AUTHENTICATION_ERROR':
        return 'Identifiants incorrects'
      case 'FORBIDDEN':
      case 'ACCESS_DENIED':
        return 'Vous n\'avez pas les permissions nécessaires'
      case 'NOT_FOUND':
        return 'Ressource non trouvée'
      case 'SERVER_ERROR':
        return 'Erreur serveur. Veuillez réessayer plus tard.'
      case 'TIMEOUT':
        return 'La requête a pris trop de temps'
      default:
        return error.message || 'Une erreur est survenue'
    }
  }

  if (error instanceof NetworkError) {
    return 'Erreur de connexion. Vérifiez votre connexion internet.'
  }

  if (error instanceof TimeoutError) {
    return 'La requête a pris trop de temps. Veuillez réessayer.'
  }

  if (error instanceof Error) {
    return error.message || 'Une erreur inattendue est survenue'
  }

  return 'Une erreur inconnue est survenue'
}

/**
 * Affiche une erreur API dans un toast
 */
export function showApiError(error: unknown, title: string = 'Erreur'): void {
  const message = getErrorMessage(error)
  
  toast({
    title,
    description: message,
    variant: 'destructive',
  })
}

/**
 * Gère une erreur API avec logging et affichage utilisateur
 */
export function handleApiError(
  error: unknown,
  context: string = 'Opération',
  showToast: boolean = true
): string {
  const message = getErrorMessage(error)
  
  // Logger l'erreur pour le débogage
  console.error(`[${context}] Erreur API:`, error)
  
  // Afficher le toast si demandé
  if (showToast) {
    showApiError(error, context)
  }
  
  return message
}

/**
 * Wrapper pour les fonctions async avec gestion d'erreur automatique
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: string = 'Opération',
  showToast: boolean = true
): Promise<T | null> {
  try {
    return await fn()
  } catch (error) {
    handleApiError(error, context, showToast)
    return null
  }
}

