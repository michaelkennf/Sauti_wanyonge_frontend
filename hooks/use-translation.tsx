"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { fr } from '@/lib/translations/fr'

// Types pour les langues supportées - seulement français
export type SupportedLocale = 'fr'
export type TranslationKey = keyof typeof fr

// Interface pour les traductions
interface Translations {
  [key: string]: any
}

// Contexte de traduction
interface TranslationContextType {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  isLoading: boolean
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

// Hook personnalisé pour utiliser les traductions
export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}

// Fonction pour obtenir les traductions selon la langue - seulement français
function getTranslations(locale: SupportedLocale): Translations {
  return fr
}

// Fonction pour obtenir une traduction avec interpolation de paramètres
function getTranslation(
  translations: Translations,
  key: string,
  params?: Record<string, string | number>
): string {
  const keys = key.split('.')
  let value: any = translations

  // Naviguer dans l'objet de traduction
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      console.warn(`Translation key "${key}" not found`)
      return key // Retourner la clé si la traduction n'est pas trouvée
    }
  }

  // Si la valeur est une chaîne, appliquer l'interpolation
  if (typeof value === 'string') {
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match
      })
    }
    return value
  }

  return key
}

// Provider de traduction
interface TranslationProviderProps {
  children: ReactNode
  initialLocale?: SupportedLocale
}

export function TranslationProvider({ children, initialLocale = 'fr' }: TranslationProviderProps) {
  // Toujours utiliser le français, initialiser directement
  const [locale, setLocale] = useState<SupportedLocale>('fr')
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Marquer que nous sommes côté client
  useEffect(() => {
    setIsClient(true)
    // Nettoyer le localStorage si une autre langue était sauvegardée
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('preferred-locale')
      if (savedLocale && savedLocale !== 'fr') {
        localStorage.setItem('preferred-locale', 'fr')
      }
    }
  }, [])

  // Sauvegarder la langue dans le localStorage (côté client uniquement)
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      localStorage.setItem('preferred-locale', locale)
    }
  }, [locale, isClient])

  // Fonction pour changer de langue (toujours français maintenant)
  const handleSetLocale = (newLocale: SupportedLocale) => {
    setIsLoading(true)
    setLocale('fr') // Toujours forcer le français
    
    // Simuler un délai de chargement pour l'UX
    setTimeout(() => {
      setIsLoading(false)
    }, 300)
  }

  // Fonction de traduction
  const t = (key: string, params?: Record<string, string | number>): string => {
    const translations = getTranslations(locale)
    return getTranslation(translations, key, params)
  }

  const value: TranslationContextType = {
    locale,
    setLocale: handleSetLocale,
    t,
    isLoading
  }

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

// Composant pour éviter l'hydratation - affiche le contenu seulement côté client
export function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Hook pour obtenir les informations de langue - seulement français
export function useLocale() {
  const { locale, setLocale, isLoading } = useTranslation()
  
  return {
    locale,
    setLocale,
    isLoading,
    languageName: 'Français',
    languageFlag: '🇫🇷',
    allLanguages: [] // Plus de sélection de langue
  }
}

// Fonction utilitaire pour obtenir une traduction directement
export function getT(locale: SupportedLocale, key: string, params?: Record<string, string | number>): string {
  const translations = getTranslations(locale)
  return getTranslation(translations, key, params)
}

// Fonction pour obtenir toutes les traductions d'une langue
export function getAllTranslations(locale: SupportedLocale): Translations {
  return getTranslations(locale)
}

// Fonction pour vérifier si une clé de traduction existe
export function hasTranslation(locale: SupportedLocale, key: string): boolean {
  const translations = getTranslations(locale)
  const keys = key.split('.')
  let value: any = translations

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return false
    }
  }

  return typeof value === 'string'
}

// Fonction pour obtenir les clés de traduction manquantes
export function getMissingTranslations(locale: SupportedLocale): string[] {
  const missing: string[] = []
  const translations = getTranslations(locale)
  const referenceTranslations = fr // Utiliser le français comme référence

  function checkKeys(obj: any, refObj: any, prefix = '') {
    for (const key in refObj) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      
      if (typeof refObj[key] === 'object' && refObj[key] !== null) {
        if (!obj[key] || typeof obj[key] !== 'object') {
          missing.push(fullKey)
        } else {
          checkKeys(obj[key], refObj[key], fullKey)
        }
      } else if (typeof refObj[key] === 'string') {
        if (!obj[key] || typeof obj[key] !== 'string') {
          missing.push(fullKey)
        }
      }
    }
  }

  checkKeys(translations, referenceTranslations)
  return missing
}
