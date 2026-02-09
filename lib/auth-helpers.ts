/**
 * Helpers d'authentification utilisant apiService
 * Remplace authService pour une intégration complète avec l'API
 */

import type { User } from "@/lib/auth"
import { apiService } from "@/lib/api"
import { logger } from "@/lib/logger"

/**
 * Récupère l'utilisateur actuel depuis localStorage
 * (stocké par apiService lors de la connexion)
 */
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      return null
    }

    const user = JSON.parse(userStr) as User
    return user
  } catch (error) {
    logger.error("Erreur lors de la récupération de l'utilisateur", error, "auth-helpers")
    return null
  }
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  const token = localStorage.getItem("auth_token")
  const user = getCurrentUser()
  
  return !!token && !!user
}

/**
 * Déconnecte l'utilisateur
 * Utilise apiService.logout() pour notifier le backend
 */
export async function logout(): Promise<void> {
  try {
    await apiService.logout()
  } catch (error) {
    logger.warn("Erreur lors de la déconnexion API", error, "auth-helpers")
    // Continuer la déconnexion locale même si l'API échoue
  } finally {
    // Nettoyer le localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("user")
    }
  }
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 * Tolère les différences de casse (ADMIN vs admin)
 */
export function hasRole(user: User | null, role: User["role"]): boolean {
  if (!user || !role) return false
  const userRole = (user.role || '').toUpperCase()
  const checkRole = (role || '').toUpperCase()
  return userRole === checkRole
}

/**
 * Vérifie si l'utilisateur a un des rôles requis
 * Tolère les différences de casse (ADMIN vs admin)
 */
export function hasAnyRole(user: User | null, roles: User["role"][]): boolean {
  if (!user || !roles.length) return false
  const userRole = (user.role || '').toUpperCase()
  const normalizedRoles = roles.map(r => (r || '').toUpperCase())
  return normalizedRoles.includes(userRole)
}

