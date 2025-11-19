// Service Worker pour Sauti ya Wa Nyonge - Mode hors ligne
const CACHE_NAME = 'sauti-ya-wa-nyonge-v1'
const OFFLINE_CACHE_NAME = 'sauti-ya-wa-nyonge-offline-v1'

// Ressources à mettre en cache pour le mode hors ligne
const CACHE_URLS = [
  '/',
  '/enqueteur/formulaire',
  '/auth/investigator-login',
  '/offline',
  '/manifest.json',
  // Ajouter les autres pages importantes
]

// Ressources statiques à mettre en cache
const STATIC_CACHE_URLS = [
  '/_next/static/',
  '/images/',
  '/icons/',
  // Ajouter les autres ressources statiques
]

// Installer le Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation en cours...')
  
  event.waitUntil(
    Promise.all([
      // Cache principal
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Service Worker: Mise en cache des ressources principales')
        return cache.addAll(CACHE_URLS)
      }),
      // Cache hors ligne
      caches.open(OFFLINE_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Préparation du cache hors ligne')
        return cache.addAll([
          '/offline',
          // Ajouter les ressources essentielles pour le mode hors ligne
        ])
      })
    ])
  )
  
  // Forcer l'activation immédiate
  self.skipWaiting()
})

// Activer le Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activation en cours...')
  
  event.waitUntil(
    Promise.all([
      // Nettoyer les anciens caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE_NAME) {
              console.log('Service Worker: Suppression de l\'ancien cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      // Prendre le contrôle immédiatement
      self.clients.claim()
    ])
  )
})

// Intercepter les requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) {
    return
  }
  
  // Stratégie de cache pour différentes types de requêtes
  if (request.method === 'GET') {
    // Pages et ressources statiques
    if (url.pathname.startsWith('/_next/static/') || 
        url.pathname.startsWith('/images/') ||
        url.pathname.startsWith('/icons/')) {
      event.respondWith(cacheFirstStrategy(request))
    }
    // Pages de l'application
    else if (url.pathname.startsWith('/enqueteur/') ||
             url.pathname.startsWith('/auth/') ||
             url.pathname === '/') {
      event.respondWith(networkFirstStrategy(request))
    }
    // API calls
    else if (url.pathname.startsWith('/api/')) {
      event.respondWith(networkOnlyStrategy(request))
    }
    // Autres ressources
    else {
      event.respondWith(staleWhileRevalidateStrategy(request))
    }
  }
  // Requêtes POST/PUT/DELETE - toujours essayer le réseau d'abord
  else {
    event.respondWith(networkOnlyStrategy(request))
  }
})

// Stratégie Cache First - pour les ressources statiques
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('Service Worker: Erreur cache first:', error)
    return new Response('Ressource non disponible hors ligne', { status: 503 })
  }
}

// Stratégie Network First - pour les pages importantes
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('Service Worker: Réseau indisponible, utilisation du cache')
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Page hors ligne par défaut
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('/offline')
      return offlineResponse || new Response('Page hors ligne', { status: 503 })
    }
    
    return new Response('Ressource non disponible hors ligne', { status: 503 })
  }
}

// Stratégie Stale While Revalidate - pour les autres ressources
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request)
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(CACHE_NAME)
      cache.then(c => c.put(request, networkResponse.clone()))
    }
    return networkResponse
  }).catch(() => {
    // En cas d'erreur réseau, retourner la version en cache
    return cachedResponse
  })
  
  return cachedResponse || fetchPromise
}

// Stratégie Network Only - pour les API calls
async function networkOnlyStrategy(request) {
  try {
    return await fetch(request)
  } catch (error) {
    console.log('Service Worker: Erreur réseau pour:', request.url)
    
    // Pour les requêtes POST/PUT/DELETE, retourner une erreur spécifique
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({
        error: 'Hors ligne',
        message: 'Cette action nécessite une connexion internet. Les données seront synchronisées dès la reconnexion.',
        offline: true
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    throw error
  }
}

// Gérer les messages du client
self.addEventListener('message', (event) => {
  const { type, payload } = event.data
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
      
    case 'GET_CACHE_STATUS':
      event.ports[0].postMessage({
        type: 'CACHE_STATUS',
        payload: {
          cacheName: CACHE_NAME,
          offlineCacheName: OFFLINE_CACHE_NAME
        }
      })
      break
      
    case 'CLEAR_CACHE':
      caches.delete(CACHE_NAME).then(() => {
        event.ports[0].postMessage({
          type: 'CACHE_CLEARED',
          payload: { success: true }
        })
      })
      break
      
    case 'CACHE_URLS':
      if (payload && payload.urls) {
        caches.open(CACHE_NAME).then((cache) => {
          return cache.addAll(payload.urls)
        }).then(() => {
          event.ports[0].postMessage({
            type: 'URLS_CACHED',
            payload: { success: true }
          })
        })
      }
      break
  }
})

// Gérer les notifications push (pour les futures fonctionnalités)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: 'Voir les détails',
          icon: '/icons/checkmark.png'
        },
        {
          action: 'close',
          title: 'Fermer',
          icon: '/icons/xmark.png'
        }
      ]
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Synchronisation en arrière-plan:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    // Logique de synchronisation des données hors ligne
    console.log('Service Worker: Synchronisation des données hors ligne...')
    
    // Notifier le client que la synchronisation est terminée
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        payload: { timestamp: Date.now() }
      })
    })
  } catch (error) {
    console.error('Service Worker: Erreur lors de la synchronisation:', error)
  }
}

// Gérer les erreurs globales
self.addEventListener('error', (event) => {
  console.error('Service Worker: Erreur globale:', event.error)
})

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Promesse rejetée non gérée:', event.reason)
})

console.log('Service Worker: Chargé et prêt')
