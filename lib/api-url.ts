/**
 * Utilitaire centralisé pour obtenir l'URL de l'API
 * Gère automatiquement la détection du domaine en production
 */

export function getApiUrl(): string {
  // Si on est côté client, vérifier window.location pour détecter l'environnement
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const protocol = window.location.protocol
    
    // Si on est en production (pas localhost)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Priorité 1: Variable d'environnement explicite
      if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL
      }
      
      // Priorité 2: Détecter automatiquement le sous-domaine API
      // Si le frontend est sur vbgsos.fikiri.org, l'API est sur api.vbgsos.fikiri.org
      const domain = hostname.replace(/^www\./, '') // Retirer www si présent
      
      // Si on est déjà sur api.*, utiliser directement
      if (domain.startsWith('api.')) {
        return `${protocol}//${domain}/api`
      }
      
      // Sinon, essayer d'ajouter le préfixe api.
      // Exemple: vbgsos.fikiri.org -> api.vbgsos.fikiri.org/api
      const apiDomain = `api.${domain}`
      return `${protocol}//${apiDomain}/api`
    }
  }
  
  // Par défaut, utiliser localhost en développement ou la variable d'environnement
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
}

export function getApiBaseUrl(): string {
  // Si on est côté client, vérifier window.location pour détecter l'environnement
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const protocol = window.location.protocol
    
    // Si on est en production (pas localhost)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Priorité 1: Variable d'environnement explicite
      if (process.env.NEXT_PUBLIC_API_BASE_URL) {
        return process.env.NEXT_PUBLIC_API_BASE_URL
      }
      
      // Priorité 2: Détecter automatiquement le sous-domaine API
      const domain = hostname.replace(/^www\./, '') // Retirer www si présent
      
      // Si on est déjà sur api.*, utiliser directement
      if (domain.startsWith('api.')) {
        return `${protocol}//${domain}`
      }
      
      // Sinon, essayer d'ajouter le préfixe api.
      // Exemple: vbgsos.fikiri.org -> api.vbgsos.fikiri.org
      const apiDomain = `api.${domain}`
      return `${protocol}//${apiDomain}`
    }
  }
  
  // Par défaut, utiliser localhost en développement ou la variable d'environnement
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
}
