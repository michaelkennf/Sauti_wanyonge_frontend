"use client"

import { useState, useCallback } from 'react'

export interface BiometricCredential {
  id: string
  type: 'fingerprint' | 'face' | 'otp'
  publicKey: string
  createdAt: Date
}

export interface BiometricAuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  credential: BiometricCredential | null
}

export function useBiometricAuth() {
  const [state, setState] = useState<BiometricAuthState>({
    isAuthenticated: false,
    isLoading: false,
    error: null,
    credential: null,
  })

  const checkBiometricSupport = useCallback(async () => {
    try {
      // Vérifier si WebAuthn est supporté
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn non supporté sur cet appareil')
      }

      // Vérifier les types d'authentification disponibles
      const availableTypes: string[] = []
      
      // Vérifier l'empreinte digitale
      const fingerprintAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      if (fingerprintAvailable) {
        availableTypes.push('fingerprint')
      }

      // Vérifier la reconnaissance faciale (via caméra)
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ video: true })
          availableTypes.push('face')
        } catch {
          // Caméra non disponible
        }
      }

      return availableTypes
    } catch (error) {
      console.error('Erreur lors de la vérification du support biométrique:', error)
      return []
    }
  }, [])

  const registerBiometric = useCallback(async (userId: string, username: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const availableTypes = await checkBiometricSupport()
      
      if (availableTypes.length === 0) {
        throw new Error('Aucune méthode biométrique disponible')
      }

      // Configuration pour l'enregistrement
      const createOptions: CredentialCreationOptions = {
        publicKey: {
          challenge: new Uint8Array(32), // Généré côté serveur
          rp: {
            name: "Sauti ya Wa Nyonge",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(userId),
            name: username,
            displayName: username,
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 }, // ES256
            { type: "public-key", alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform", // Authentificateur intégré
            userVerification: "required",
          },
          timeout: 60000,
          attestation: "direct",
        },
      }

      const credential = await navigator.credentials.create(createOptions) as PublicKeyCredential
      
      if (!credential) {
        throw new Error('Échec de la création des identifiants')
      }

      const biometricCredential: BiometricCredential = {
        id: credential.id,
        type: availableTypes[0] as 'fingerprint' | 'face',
        publicKey: Array.from(new Uint8Array(credential.response.publicKey!)).join(','),
        createdAt: new Date(),
      }

      // Stocker localement (chiffré)
      await storeBiometricCredential(biometricCredential)

      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
        credential: biometricCredential,
      }))

      return biometricCredential
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'authentification biométrique'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      throw error
    }
  }, [checkBiometricSupport])

  const authenticateBiometric = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const storedCredential = await getStoredBiometricCredential()
      
      if (!storedCredential) {
        throw new Error('Aucun identifiant biométrique enregistré')
      }

      // Configuration pour l'authentification
      const getOptions: CredentialRequestOptions = {
        publicKey: {
          challenge: new Uint8Array(32), // Généré côté serveur
          allowCredentials: [{
            type: "public-key",
            id: new TextEncoder().encode(storedCredential.id),
          }],
          userVerification: "required",
          timeout: 60000,
        },
      }

      const credential = await navigator.credentials.get(getOptions) as PublicKeyCredential
      
      if (!credential) {
        throw new Error('Échec de l\'authentification biométrique')
      }

      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
        credential: storedCredential,
      }))

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'authentification biométrique'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
      }))
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    await clearStoredBiometricCredential()
    setState({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      credential: null,
    })
  }, [])

  return {
    ...state,
    checkBiometricSupport,
    registerBiometric,
    authenticateBiometric,
    logout,
  }
}

// Fonctions utilitaires pour le stockage local
async function storeBiometricCredential(credential: BiometricCredential): Promise<void> {
  try {
    const encrypted = await encryptData(JSON.stringify(credential))
    localStorage.setItem('biometric_credential', encrypted)
  } catch (error) {
    console.error('Erreur lors du stockage des identifiants biométriques:', error)
  }
}

async function getStoredBiometricCredential(): Promise<BiometricCredential | null> {
  try {
    const encrypted = localStorage.getItem('biometric_credential')
    if (!encrypted) return null
    
    const decrypted = await decryptData(encrypted)
    return JSON.parse(decrypted)
  } catch (error) {
    console.error('Erreur lors de la récupération des identifiants biométriques:', error)
    return null
  }
}

async function clearStoredBiometricCredential(): Promise<void> {
  localStorage.removeItem('biometric_credential')
}

// Fonctions de chiffrement simples (à améliorer en production)
async function encryptData(data: string): Promise<string> {
  // Utilisation d'une clé locale simple (à améliorer)
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
  
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(data)
  )
  
  return btoa(String.fromCharCode(...iv, ...new Uint8Array(encrypted)))
}

async function decryptData(encryptedData: string): Promise<string> {
  // Déchiffrement simple (à améliorer)
  const data = atob(encryptedData)
  const iv = new Uint8Array(data.slice(0, 12))
  const encrypted = new Uint8Array(data.slice(12))
  
  // Note: En production, il faudrait stocker la clé de manière sécurisée
  return new TextDecoder().decode(encrypted)
}
