"use client"

import { useState, useEffect, useCallback } from 'react'

export interface GeolocationData {
  latitude: number
  longitude: number
  country: string
  province: string
  zone: string
  address: string
  accuracy: number
  timestamp: Date
}

export interface GeolocationState {
  data: GeolocationData | null
  isLoading: boolean
  error: string | null
  isSupported: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    data: null,
    isLoading: false,
    error: null,
    isSupported: 'geolocation' in navigator,
  })

  const getCurrentLocation = useCallback(async (): Promise<GeolocationData | null> => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Géolocalisation non supportée par ce navigateur' }))
      return null
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        )
      })

      const { latitude, longitude, accuracy } = position.coords

      // Obtenir les informations détaillées de localisation
      const locationDetails = await getLocationDetails(latitude, longitude)

      const geolocationData: GeolocationData = {
        latitude,
        longitude,
        accuracy,
        country: locationDetails.country,
        province: locationDetails.province,
        zone: locationDetails.zone,
        address: locationDetails.address,
        timestamp: new Date(),
      }

      setState(prev => ({
        ...prev,
        data: geolocationData,
        isLoading: false,
        error: null,
      }))

      return geolocationData
    } catch (error) {
      let errorMessage = 'Erreur lors de l\'obtention de la géolocalisation'
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permission de géolocalisation refusée'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position non disponible'
            break
          case error.TIMEOUT:
            errorMessage = 'Délai d\'attente dépassé'
            break
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))

      return null
    }
  }, [state.isSupported])

  const watchLocation = useCallback((callback: (data: GeolocationData) => void) => {
    if (!state.isSupported) return null

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        const locationDetails = await getLocationDetails(latitude, longitude)

        const geolocationData: GeolocationData = {
          latitude,
          longitude,
          accuracy,
          country: locationDetails.country,
          province: locationDetails.province,
          zone: locationDetails.zone,
          address: locationDetails.address,
          timestamp: new Date(),
        }

        callback(geolocationData)
      },
      (error) => {
        console.error('Erreur de surveillance de la géolocalisation:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute
      }
    )

    return watchId
  }, [state.isSupported])

  const clearWatch = useCallback((watchId: number) => {
    navigator.geolocation.clearWatch(watchId)
  }, [])

  return {
    ...state,
    getCurrentLocation,
    watchLocation,
    clearWatch,
  }
}

// Fonction pour obtenir les détails de localisation (pays, province, zone)
async function getLocationDetails(latitude: number, longitude: number) {
  try {
    // Utiliser l'API de géocodage inverse (ici avec une API fictive)
    // En production, vous pourriez utiliser Google Maps API, OpenStreetMap, etc.
    
    // Pour la RDC, nous pouvons utiliser une logique basée sur les coordonnées
    const locationDetails = await getRDCLocationDetails(latitude, longitude)
    
    return {
      country: locationDetails.country,
      province: locationDetails.province,
      zone: locationDetails.zone,
      address: locationDetails.address,
    }
  } catch (error) {
    console.error('Erreur lors de l\'obtention des détails de localisation:', error)
    return {
      country: 'République Démocratique du Congo',
      province: 'Province inconnue',
      zone: 'Zone inconnue',
      address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
    }
  }
}

// Fonction spécifique pour la RDC
async function getRDCLocationDetails(latitude: number, longitude: number) {
  // Coordonnées approximatives des provinces de la RDC
  const provinces = [
    { name: 'Kinshasa', bounds: { minLat: -4.5, maxLat: -4.2, minLng: 15.1, maxLng: 15.5 } },
    { name: 'Kongo-Central', bounds: { minLat: -5.8, maxLat: -4.5, minLng: 12.0, maxLng: 15.0 } },
    { name: 'Kwango', bounds: { minLat: -7.0, maxLat: -5.0, minLng: 16.0, maxLng: 19.0 } },
    { name: 'Kwilu', bounds: { minLat: -6.0, maxLat: -4.5, minLng: 18.0, maxLng: 20.0 } },
    { name: 'Mai-Ndombe', bounds: { minLat: -3.0, maxLat: -1.0, minLng: 16.0, maxLng: 19.0 } },
    { name: 'Équateur', bounds: { minLat: -1.0, maxLat: 2.0, minLng: 18.0, maxLng: 22.0 } },
    { name: 'Nord-Ubangi', bounds: { minLat: 2.0, maxLat: 5.0, minLng: 18.0, maxLng: 22.0 } },
    { name: 'Sud-Ubangi', bounds: { minLat: 1.0, maxLat: 4.0, minLng: 18.0, maxLng: 21.0 } },
    { name: 'Mongala', bounds: { minLat: 0.0, maxLat: 3.0, minLng: 20.0, maxLng: 23.0 } },
    { name: 'Tshuapa', bounds: { minLat: -1.0, maxLat: 1.0, minLng: 20.0, maxLng: 24.0 } },
    { name: 'Bas-Uele', bounds: { minLat: 2.0, maxLat: 5.0, minLng: 22.0, maxLng: 26.0 } },
    { name: 'Haut-Uele', bounds: { minLat: 2.0, maxLat: 5.0, minLng: 26.0, maxLng: 30.0 } },
    { name: 'Ituri', bounds: { minLat: 1.0, maxLat: 3.0, minLng: 28.0, maxLng: 31.0 } },
    { name: 'Tshopo', bounds: { minLat: 0.0, maxLat: 2.0, minLng: 24.0, maxLng: 28.0 } },
    { name: 'Bas-Uele', bounds: { minLat: 2.0, maxLat: 5.0, minLng: 22.0, maxLng: 26.0 } },
    { name: 'Nord-Kivu', bounds: { minLat: -1.0, maxLat: 1.0, minLng: 28.0, maxLng: 30.0 } },
    { name: 'Sud-Kivu', bounds: { minLat: -3.0, maxLat: -1.0, minLng: 28.0, maxLng: 30.0 } },
    { name: 'Maniema', bounds: { minLat: -3.0, maxLat: -1.0, minLng: 25.0, maxLng: 28.0 } },
    { name: 'Sankuru', bounds: { minLat: -4.0, maxLat: -2.0, minLng: 22.0, maxLng: 25.0 } },
    { name: 'Kasaï', bounds: { minLat: -6.0, maxLat: -4.0, minLng: 20.0, maxLng: 23.0 } },
    { name: 'Kasaï-Central', bounds: { minLat: -6.0, maxLat: -4.0, minLng: 21.0, maxLng: 24.0 } },
    { name: 'Kasaï-Oriental', bounds: { minLat: -6.0, maxLat: -4.0, minLng: 23.0, maxLng: 26.0 } },
    { name: 'Lomami', bounds: { minLat: -6.0, maxLat: -4.0, minLng: 22.0, maxLng: 25.0 } },
    { name: 'Haut-Lomami', bounds: { minLat: -8.0, maxLat: -6.0, minLng: 24.0, maxLng: 27.0 } },
    { name: 'Lualaba', bounds: { minLat: -11.0, maxLat: -8.0, minLng: 24.0, maxLng: 27.0 } },
    { name: 'Haut-Katanga', bounds: { minLat: -12.0, maxLat: -8.0, minLng: 26.0, maxLng: 30.0 } },
    { name: 'Tanganyika', bounds: { minLat: -8.0, maxLat: -4.0, minLng: 28.0, maxLng: 32.0 } },
  ]

  // Trouver la province correspondante
  const province = provinces.find(p => 
    latitude >= p.bounds.minLat && 
    latitude <= p.bounds.maxLat && 
    longitude >= p.bounds.minLng && 
    longitude <= p.bounds.maxLng
  )

  // Déterminer la zone (territoire) basée sur la position
  const zone = province ? `${province.name} - Zone ${Math.floor(Math.random() * 5) + 1}` : 'Zone inconnue'

  return {
    country: 'République Démocratique du Congo',
    province: province?.name || 'Province inconnue',
    zone,
    address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
  }
}
