// Service API pour communiquer avec le backend
import { getApiUrl, getApiBaseUrl } from './api-url'

const API_BASE_URL = getApiBaseUrl()
const API_URL = getApiUrl()

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    email: string
    role: string
    status: string
    aiAccessLevel: string
  }
  token: string
  refreshToken: string
  expiresIn: number
}

export interface ComplaintRequest {
  type: 'VICTIM_DIRECT' | 'INVESTIGATOR_ASSISTED'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  beneficiaryData: {
    name: string
    sex: 'MALE' | 'FEMALE' | 'OTHER'
    age: number
    birthDate?: string
    territory: string
    groupement: string
    village: string
    householdSize: number
    currentAddress: string
    status: string
    natureOfFacts: string
    fingerprint?: string
    faceScan?: string
    photo?: string
  }
  incidentData?: {
    type?: string
    date?: string
    time?: string
    description?: string
    address?: string
  }
  geolocation: {
    latitude: number
    longitude: number
    province?: string
    territory?: string
    groupement?: string
    village?: string
    address?: string
    accuracy?: number
  }
  evidence?: Array<{
    type: string
    fileName: string
    fileData?: string // Déprécié: utiliser filePath à la place
    filePath?: string // Chemin du fichier uploadé
    fileSize?: number // Taille du fichier en bytes
    mimeType: string
    isRequired: boolean
  }>
  services?: string[]
  investigatorComment?: string
}

export interface ComplaintResponse {
  id: string
  trackingCode: string
  status: string
  createdAt: string
  assignedTo?: string
}

// Types d'erreurs API
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Erreur de connexion réseau') {
    super(message)
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'La requête a pris trop de temps') {
    super(message)
    this.name = 'TimeoutError'
  }
}

class ApiService {
  private baseURL: string
  private token: string | null = null
  private refreshToken: string | null = null
  private isRefreshing = false
  private refreshPromise: Promise<string> | null = null

  constructor() {
    this.baseURL = API_URL
    // Récupérer les tokens depuis le localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
      this.refreshToken = localStorage.getItem('refresh_token')
    }
  }

  // Méthode pour mettre à jour les tokens depuis localStorage
  private syncTokensFromStorage(): void {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token')
      const storedRefreshToken = localStorage.getItem('refresh_token')
      if (storedToken) {
        this.token = storedToken
      }
      if (storedRefreshToken) {
        this.refreshToken = storedRefreshToken
      }
    }
  }

  // Rafraîchir le token automatiquement
  private async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    // Récupérer le refreshToken depuis localStorage si pas en mémoire
    if (!this.refreshToken && typeof window !== 'undefined') {
      this.refreshToken = localStorage.getItem('refresh_token')
    }

    if (!this.refreshToken) {
      throw new ApiError('Token de rafraîchissement non disponible', 401, 'NO_REFRESH_TOKEN')
    }

    this.isRefreshing = true
    this.refreshPromise = (async () => {
      try {
        // Récupérer le token CSRF pour la requête POST
        const csrfToken = await this.ensureCSRFToken()
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }
        if (csrfToken) {
          headers['X-CSRF-Token'] = csrfToken
        }

        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ refreshToken: this.refreshToken }),
          credentials: 'include', // Important pour les cookies
        })

        if (!response.ok) {
          // Token invalide, déconnecter l'utilisateur
          this.logout()
          throw new ApiError('Session expirée', 401, 'SESSION_EXPIRED')
        }

        const data = await response.json()
        if (data.success && data.data) {
          this.token = data.data.token
          if (data.data.refreshToken) {
            this.refreshToken = data.data.refreshToken
          }
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', this.token)
            if (this.refreshToken) {
              localStorage.setItem('refresh_token', this.refreshToken)
            }
          }
          
          return this.token
        }
        
        throw new ApiError('Erreur lors du rafraîchissement du token', 401)
      } finally {
        this.isRefreshing = false
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  // Méthode pour récupérer le token CSRF depuis le cookie
  private getCSRFToken(): string | null {
    if (typeof window === 'undefined') return null
    
    // Récupérer depuis le cookie
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === 'csrf_token') {
        return decodeURIComponent(value)
      }
    }
    
    return null
  }

  // Méthode pour récupérer ou générer un token CSRF
  private async ensureCSRFToken(): Promise<string | null> {
    // D'abord, essayer de récupérer depuis le cookie
    let token = this.getCSRFToken()
    
    // Si pas de token, faire une requête GET pour en obtenir un
    if (!token) {
      try {
        const response = await fetch(`${this.baseURL}/csrf-token`, {
          method: 'GET',
          credentials: 'include', // Important pour recevoir les cookies
        })
        
        if (response.ok) {
          const data = await response.json()
          token = data.data?.csrfToken || null
        }
      } catch (error) {
        console.warn('Impossible de récupérer le token CSRF:', error)
      }
    }
    
    return token
  }

  // Méthodes utilitaires avec retry et meilleure gestion d'erreurs
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = 2
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const method = options.method || 'GET'
    
    // Timeout adaptatif selon le type de requête
    // Timeouts augmentés pour gérer les erreurs QUIC/HTTP3
    // Les erreurs QUIC peuvent nécessiter plus de temps pour se résoudre
    const timeout = method === 'GET' ? 30000 : 60000 // 30s pour GET, 60s pour POST/PUT/DELETE
    
    // Ne pas définir Content-Type pour FormData (le navigateur le fait automatiquement)
    const isFormData = options.body instanceof FormData
    const defaultHeaders: HeadersInit = isFormData ? {} : {
      'Content-Type': 'application/json',
    }

    // Synchroniser les tokens depuis localStorage à chaque requête
    this.syncTokensFromStorage()
    
    // Récupérer le token pour l'utiliser dans les headers
    const token = this.token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null)
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`
      // Mettre à jour le token en mémoire
      this.token = token
    }

    // Ajouter le token CSRF pour les méthodes mutantes
    const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE']
    if (mutatingMethods.includes(method)) {
      const csrfToken = await this.ensureCSRFToken()
      if (csrfToken) {
        defaultHeaders['X-CSRF-Token'] = csrfToken
      }
    }

    const makeRequest = async (): Promise<Response> => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...defaultHeaders,
            ...options.headers,
          },
          signal: controller.signal,
          // Important: inclure les cookies pour le CSRF
          credentials: 'include',
          // Optimisation: cache pour les requêtes GET
          cache: method === 'GET' ? 'default' : 'no-store',
        })

        clearTimeout(timeoutId)
        return response
      } catch (error) {
        clearTimeout(timeoutId)
        throw error
      }
    }

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        let response = await makeRequest()

        // Gérer les erreurs 401 (token expiré) avec refresh automatique
        if (response.status === 401 && attempt < retries) {
          // Récupérer le refreshToken depuis localStorage si pas en mémoire
          if (!this.refreshToken && typeof window !== 'undefined') {
            this.refreshToken = localStorage.getItem('refresh_token')
          }
          
          if (this.refreshToken) {
            try {
              await this.refreshAccessToken()
              // Mettre à jour le token dans les headers pour la nouvelle requête
              const newToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : this.token
              if (newToken) {
                defaultHeaders['Authorization'] = `Bearer ${newToken}`
                this.token = newToken
              }
              // Réessayer la requête avec le nouveau token
              response = await makeRequest()
            } catch (refreshError) {
              // Si le refresh échoue, déconnecter
              this.logout()
              throw new ApiError('Session expirée. Veuillez vous reconnecter.', 401, 'SESSION_EXPIRED')
            }
          } else {
            // Pas de refreshToken disponible, déconnecter
            this.logout()
            throw new ApiError('Session expirée. Veuillez vous reconnecter.', 401, 'SESSION_EXPIRED')
          }
        }

        // Gérer les erreurs de parsing JSON
        let data: any
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          try {
            data = await response.json()
          } catch (jsonError) {
            throw new ApiError('Réponse invalide du serveur', response.status, 'INVALID_RESPONSE')
          }
        } else {
          // Si ce n'est pas du JSON, créer une réponse basique
          const text = await response.text()
          data = { message: text || 'Erreur serveur', success: false }
        }

        if (!response.ok) {
          // Erreurs client (4xx) - ne pas retry
          if (response.status >= 400 && response.status < 500) {
            // Pour les erreurs 401, vérifier si c'est un problème de token
            if (response.status === 401) {
              // Nettoyer le token invalide
              if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token')
                localStorage.removeItem('refresh_token')
                localStorage.removeItem('user')
              }
              this.token = null
              this.refreshToken = null
            }
            
            throw new ApiError(
              data.message || data.error || 'Erreur de requête',
              response.status,
              data.code || 'CLIENT_ERROR',
              data.details
            )
          }
          
          // Erreurs serveur (5xx) - retry si on a encore des tentatives
          if (response.status >= 500 && attempt < retries) {
            lastError = new ApiError(
              data.message || 'Erreur serveur',
              response.status,
              data.code || 'SERVER_ERROR'
            )
            // Attendre avant de réessayer (backoff exponentiel)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
            continue
          }
          
          throw new ApiError(
            data.message || data.error || 'Erreur de requête',
            response.status,
            data.code || 'HTTP_ERROR',
            data.details
          )
        }

        return data
      } catch (error) {
        if (error instanceof ApiError) {
          // Ne pas retry les erreurs API (déjà gérées)
          throw error
        }

        if (error instanceof Error) {
          // Timeout
          if (error.name === 'AbortError') {
            if (attempt < retries) {
              lastError = new TimeoutError()
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
              continue
            }
            throw new TimeoutError()
          }

          // Erreur réseau (y compris QUIC/HTTP3)
          const isNetworkError = error.message.includes('fetch') || 
                                error.message.includes('network') || 
                                error.message.includes('QUIC') ||
                                error.message.includes('ERR_QUIC') ||
                                !navigator.onLine
          
          if (isNetworkError) {
            if (attempt < retries) {
              lastError = new NetworkError('Erreur de connexion réseau')
              // Attendre plus longtemps pour les erreurs QUIC (peut être temporaire)
              const delay = error.message.includes('QUIC') ? Math.pow(2, attempt) * 2000 : Math.pow(2, attempt) * 1000
              await new Promise(resolve => setTimeout(resolve, delay))
              continue
            }
            
            // Message d'erreur plus détaillé
            const isDnsError = error.message?.includes('ERR_NAME_NOT_RESOLVED') || 
                              error.message?.includes('Failed to fetch') ||
                              error.name === 'TypeError'
            
            const isQuicError = error.message?.includes('QUIC') || error.message?.includes('ERR_QUIC')
            
            let errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.'
            if (isDnsError) {
              errorMessage = `Impossible de se connecter à l'API backend (${this.baseURL}). Vérifiez que NEXT_PUBLIC_API_URL est correctement configuré dans les variables d'environnement.`
            } else if (isQuicError) {
              errorMessage = 'Erreur de connexion réseau (HTTP/3). Le serveur peut être temporairement indisponible. Veuillez réessayer.'
            }
            
            throw new NetworkError(errorMessage)
          }
        }

        lastError = error instanceof Error ? error : new Error('Erreur inconnue')
        
        // Si on a encore des tentatives, continuer
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
          continue
        }
      }
    }

    // Si on arrive ici, toutes les tentatives ont échoué
    throw lastError || new Error('Erreur inconnue')
  }

  // Authentification
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    if (response.success && response.data) {
      this.token = response.data.token
      this.refreshToken = response.data.refreshToken
      
      // Stocker immédiatement dans localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.data.token)
        if (response.data.refreshToken) {
          localStorage.setItem('refresh_token', response.data.refreshToken)
        }
        // S'assurer que l'utilisateur est bien stocké avec le bon format
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user))
        }
        
        // Forcer la synchronisation du localStorage
        if (localStorage.getItem('auth_token') !== response.data.token) {
          console.warn('Token non correctement stocké dans localStorage')
        }
      }
    }

    return response.data!
  }

  async investigatorLogin(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/investigator-login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    if (response.success && response.data) {
      this.token = response.data.token
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('refresh_token', response.data.refreshToken)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
    }

    return response.data!
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' }, 0) // Pas de retry pour logout
    } catch (error) {
      // Ignorer les erreurs de logout (peut échouer si déjà déconnecté)
      // Note: logger n'est pas importé ici pour éviter les dépendances circulaires
      if (process.env.NODE_ENV === 'development') {
        console.warn('Erreur lors de la déconnexion:', error)
      }
    } finally {
      this.token = null
      this.refreshToken = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
      }
    }
  }

  // Plaintes
  async createVictimComplaint(complaint: ComplaintRequest): Promise<ComplaintResponse> {
    const response = await this.request<ComplaintResponse>('/complaints/victim', {
      method: 'POST',
      body: JSON.stringify(complaint),
    })

    return response.data!
  }

  async createInvestigatorComplaint(complaint: ComplaintRequest): Promise<ComplaintResponse> {
    const response = await this.request<ComplaintResponse>('/complaints/investigator', {
      method: 'POST',
      body: JSON.stringify(complaint),
    })

    return response.data!
  }

  async getComplaints(params?: {
    page?: number
    limit?: number
    status?: string
    type?: string
    province?: string
  }): Promise<{
    data: any[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `/complaints${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await this.request<{
      data: any[]
      pagination: any
    }>(endpoint)

    return response.data!
  }

  async getComplaintById(id: string): Promise<any> {
    const response = await this.request<any>(`/complaints/${id}`)
    return response.data!
  }

  async updateComplaintStatus(id: string, data: {
    status?: string
    treatmentStatus?: string
    treatmentDetails?: string
    transmittedTo?: string
  }): Promise<any> {
    const response = await this.request<any>(`/complaints/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return response.data!
  }

  async updateComplaintTreatment(id: string, data: {
    treatmentStatus: 'acknowledged' | 'transmitted' | 'decision'
    treatmentDetails?: string
    transmittedTo?: string
  }): Promise<any> {
    const response = await this.request<any>(`/complaints/${id}/treatment`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return response.data!
  }

  // Synchronisation hors ligne
  async syncOfflineComplaints(complaints: any[]): Promise<any[]> {
    const response = await this.request<any[]>('/complaints/offline-sync', {
      method: 'POST',
      body: JSON.stringify({ complaints }),
    })

    return response.data!
  }

  // IA
  async askAI(question: string, responseType?: string, filters?: any): Promise<any> {
    const response = await this.request<any>('/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ question, responseType, filters }),
    })

    return response.data!
  }

  async getAIHistory(params?: { page?: number; limit?: number }): Promise<any[]> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `/ai/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await this.request<any[]>(endpoint)

    return response.data!
  }

  // Géolocalisation
  async getProvinces(): Promise<any[]> {
    const response = await this.request<any[]>('/geolocation/provinces')
    return response.data!
  }

  async getTerritories(provinceId: string): Promise<any[]> {
    const response = await this.request<any[]>(`/geolocation/territories/${provinceId}`)
    return response.data!
  }

  // Statistiques
  async getDashboardStats(): Promise<any> {
    const response = await this.request<any>('/stats/dashboard')
    return response.data!
  }

  // Services
  async getServices(params?: {
    type?: string
    province?: string
    search?: string
  }): Promise<any[]> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `/services${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await this.request<any[]>(endpoint)
    return response.data!
  }

  async getServiceById(id: number): Promise<any> {
    const response = await this.request<any>(`/services/${id}`)
    return response.data!
  }

  // Biométrie
  async checkBiometric(fingerprint?: string, faceScan?: string): Promise<{
    exists: boolean
    lastComplaint?: {
      trackingCode: string
      beneficiaryName: string
      createdAt: string
      status: string
    }
    message: string
  }> {
    const response = await this.request<{
      exists: boolean
      lastComplaint?: {
        trackingCode: string
        beneficiaryName: string
        createdAt: string
        status: string
      }
      message: string
    }>('/biometric/check', {
      method: 'POST',
      body: JSON.stringify({ fingerprint, faceScan }),
    })
    return response.data!
  }

  // Historique du traitement
  /**
   * Upload de fichiers (audio, vidéo, images, documents)
   */
  async uploadFiles(files: File[]): Promise<Array<{
    id: string
    originalName: string
    fileName: string
    filePath: string
    fileUrl: string
    mimeType: string
    size: number
    uploadedAt: string
  }>> {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    const response = await this.request<{
      files: Array<{
        id: string
        originalName: string
        fileName: string
        filePath: string
        fileUrl: string
        mimeType: string
        size: number
        uploadedAt: string
      }>
      count: number
    }>('/uploads', {
      method: 'POST',
      body: formData,
      headers: {} // Ne pas définir Content-Type, laisser le navigateur le faire pour FormData
    })

    return response.files
  }

  /**
   * Upload d'un seul fichier
   */
  async uploadSingleFile(file: File): Promise<{
    id: string
    originalName: string
    fileName: string
    filePath: string
    fileUrl: string
    mimeType: string
    size: number
    uploadedAt: string
  }> {
    const formData = new FormData()
    formData.append('file', file)

    return this.request('/uploads/single', {
      method: 'POST',
      body: formData,
      headers: {} // Ne pas définir Content-Type
    })
  }

  /**
   * Obtenir l'URL de téléchargement d'un fichier
   */
  getFileUrl(filePath: string): string {
    const baseUrl = this.baseURL.replace('/api', '')
    return `${baseUrl}/uploads/${filePath}`
  }

  async getComplaintTreatmentHistory(trackingCode: string): Promise<{
    trackingCode: string
    currentStatus: string
    treatmentStatus?: string
    history: Array<{
      step: number
      status: string
      description: string
      date: string | null
      completed: boolean
    }>
  }> {
    const response = await this.request<{
      trackingCode: string
      currentStatus: string
      treatmentStatus?: string
      history: Array<{
        step: number
        status: string
        description: string
        date: string | null
        completed: boolean
      }>
    }>(`/complaints/tracking/${trackingCode}/history`)
    return response.data!
  }

  // Upload
  async getPresignedUploadUrl(fileName: string, fileType: string, fileSize: number): Promise<{
    uploadUrl: string
    fileId: string
    expiresIn: number
  }> {
    const response = await this.request<{
      uploadUrl: string
      fileId: string
      expiresIn: number
    }>('/uploads/presign', {
      method: 'POST',
      body: JSON.stringify({ fileName, fileType, fileSize }),
    })

    return response.data!
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return !!this.token
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser(): any {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  }

  // Vérifier les permissions
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    const permissions = {
      ADMIN: ['all'],
      INVESTIGATOR: ['create_complaints', 'view_own_complaints', 'use_ai_regional'],
      NGO: ['view_regional_complaints', 'update_complaint_status', 'use_ai_regional'],
      ASSURANCE: ['view_all_complaints', 'use_ai_global', 'export_data'],
      VICTIM: ['create_complaints']
    }

    const userPermissions = permissions[user.role as keyof typeof permissions] || []
    return userPermissions.includes('all') || userPermissions.includes(permission)
  }

  // Statistiques de violence
  async getViolenceStats(): Promise<Array<{
    id: string
    violenceType: string
    count: number
    lastUpdated: string
    updatedBy: string | null
  }>> {
    const response = await this.request<Array<{
      id: string
      violenceType: string
      count: number
      lastUpdated: string
      updatedBy: string | null
    }>>('/violence-stats', {
      method: 'GET',
    })
    return response.data || []
  }

  async updateViolenceStats(violenceType: string, count: number): Promise<{
    id: string
    violenceType: string
    count: number
    lastUpdated: string
    updatedBy: string | null
  }> {
    const response = await this.request<{
      id: string
      violenceType: string
      count: number
      lastUpdated: string
      updatedBy: string | null
    }>('/violence-stats', {
      method: 'PUT',
      body: JSON.stringify({ violenceType, count }),
    })
    return response.data!
  }

  async resetViolenceStats(): Promise<void> {
    await this.request('/violence-stats/reset', {
      method: 'POST',
    })
  }

  /**
   * Obtenir les statistiques avancées du dashboard
   */
  async getDashboardAnalytics(filters?: {
    startDate?: string
    endDate?: string
    province?: string
    territory?: string
  }): Promise<{
    overview: {
      total: number
      pending: number
      inProgress: number
      completed: number
      closed: number
      urgent: number
    }
    trends: {
      monthly: Array<{ month: string; cas: number }>
      weekly: Array<{ week: string; cas: number }>
    }
    distributions: {
      byViolenceType?: Array<{ name: string; value: number }>
      byType?: Array<{ name: string; value: number }>
      byProvince: Array<{ zone: string; cas: number }>
      byTreatmentStatus: Array<{ status: string; count: number }>
      byComplaintType?: Array<{ type: string; count: number }>
      byReportingMode?: Array<{ mode: string; count: number }>
    }
    metrics: {
      averageProcessingTime: number
      completionRate: number
    }
  }> {
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const response = await this.request<{
      overview: {
        total: number
        pending: number
        inProgress: number
        completed: number
        closed: number
        urgent: number
      }
      trends: {
        monthly: Array<{ month: string; cas: number }>
        weekly: Array<{ week: string; cas: number }>
      }
      distributions: {
        byViolenceType?: Array<{ name: string; value: number }>
        byType?: Array<{ name: string; value: number }>
        byProvince: Array<{ zone: string; cas: number }>
        byTreatmentStatus: Array<{ status: string; count: number }>
        byComplaintType?: Array<{ type: string; count: number }>
        byReportingMode?: Array<{ mode: string; count: number }>
      }
      metrics: {
        averageProcessingTime: number
        completionRate: number
      }
    }>(`/analytics/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`)
    return response.data!
  }

  /**
   * Exporter les cas en PDF
   */
  async exportComplaintsPDF(filters?: {
    startDate?: string
    endDate?: string
    province?: string
    territory?: string
    violenceType?: string
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED'
    complaintType?: 'VICTIM_DIRECT' | 'INVESTIGATOR_ASSISTED'
    contactPreference?: 'ANONYMOUS' | 'TO_BE_CONTACTED'
  }): Promise<Blob> {
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const url = `${this.baseURL}/reports/complaints/pdf${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors de l\'export PDF' }))
      throw new ApiError(error.message || 'Erreur lors de l\'export PDF', response.status)
    }

    return response.blob()
  }

  // ========================================================================
  // ADMIN ENDPOINTS
  // ========================================================================

  /**
   * Récupérer tous les dossiers admin avec filtres
   */
  async getAdminCases(filters?: {
    page?: number
    limit?: number
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED'
    type?: 'VICTIM_DIRECT' | 'INVESTIGATOR_ASSISTED'
    province?: string
    territory?: string
    violenceType?: string
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    startDate?: string
    endDate?: string
    sortBy?: 'date' | 'status' | 'priority' | 'province' | 'violenceType'
    sortOrder?: 'asc' | 'desc'
  }): Promise<{
    cases: any[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const response = await this.request<{
      cases: any[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }>(`/admin/cases${queryParams.toString() ? `?${queryParams.toString()}` : ''}`)
    return response.data!
  }

  /**
   * Récupérer un dossier complet par ID
   */
  async getAdminCaseById(id: string): Promise<any> {
    const response = await this.request<any>(`/admin/case/${id}`)
    return response.data!
  }

  /**
   * Mettre à jour le statut d'un dossier
   */
  async updateAdminCaseStatus(id: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED', reason?: string, notes?: string): Promise<any> {
    const response = await this.request<any>(`/admin/case/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason, notes })
    })
    return response.data!
  }

  /**
   * Ajouter des notes internes à un dossier
   */
  async addAdminCaseNotes(id: string, notes: string, isInternal: boolean = true): Promise<any> {
    const response = await this.request<any>(`/admin/case/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ notes, isInternal })
    })
    return response.data!
  }

  /**
   * Marquer une preuve comme exploitée
   */
  async markEvidenceExploited(evidenceId: string, exploited: boolean, notes?: string): Promise<any> {
    const response = await this.request<any>(`/admin/evidence/${evidenceId}/exploited`, {
      method: 'PATCH',
      body: JSON.stringify({ exploited, notes })
    })
    return response.data!
  }

  /**
   * Récupérer les statistiques globales admin
   */
  async getAdminGlobalStats(): Promise<{
    total: number
    pending: number
    inProgress: number
    completed: number
    closed: number
    byOrigin: {
      public: number
      investigator: number
    }
  }> {
    const response = await this.request<any>('/admin/stats/global')
    return response.data!
  }

  /**
   * Récupérer les statistiques par type de violence
   */
  async getAdminViolenceStats(): Promise<Array<{ type: string; count: number }>> {
    const response = await this.request<Array<{ type: string; count: number }>>('/admin/stats/violence')
    return response.data!
  }

  /**
   * Récupérer les statistiques géographiques
   */
  async getAdminLocationStats(): Promise<{
    byProvince: Array<{ province: string; count: number }>
    byTerritory: Array<{ territory: string; count: number }>
  }> {
    const response = await this.request<any>('/admin/stats/location')
    return response.data!
  }

  /**
   * Récupérer les tendances et analyses temporelles
   */
  async getAdminTrends(startDate?: string, endDate?: string): Promise<{
    trends: Array<{
      month: string
      total: number
      byStatus: { [key: string]: number }
      byType: { [key: string]: number }
    }>
  }> {
    const queryParams = new URLSearchParams()
    if (startDate) queryParams.append('startDate', startDate)
    if (endDate) queryParams.append('endDate', endDate)

    const response = await this.request<any>(`/admin/analytics/trends${queryParams.toString() ? `?${queryParams.toString()}` : ''}`)
    return response.data!
  }

  /**
   * Exporter les dossiers en Excel (admin)
   */
  async exportAdminExcel(filters?: {
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED'
    type?: 'VICTIM_DIRECT' | 'INVESTIGATOR_ASSISTED'
    province?: string
    territory?: string
    violenceType?: string
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    startDate?: string
    endDate?: string
  }): Promise<Blob> {
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const url = `${this.baseURL}/admin/export/excel${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    // Récupérer le token dynamiquement
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : this.token
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors de l\'export Excel' }))
      throw new ApiError(error.message || 'Erreur lors de l\'export Excel', response.status)
    }

    return response.blob()
  }

  /**
   * Exporter les données pour graphiques
   */
  async exportAdminGraphs(): Promise<any> {
    const response = await this.request<any>('/admin/export/graphs')
    return response.data!
  }

  /**
   * Chatbot analytique admin
   */
  async queryAdminChatbot(query: string, context?: {
    startDate?: string
    endDate?: string
    province?: string
    territory?: string
  }): Promise<{
    answer: string
    data: any
  }> {
    const response = await this.request<{
      answer: string
      data: any
    }>('/admin/chatbot/query', {
      method: 'POST',
      body: JSON.stringify({ query, context })
    })
    return response.data!
  }

  /**
   * Exporter les cas en Excel
   */
  async exportComplaintsExcel(filters?: {
    startDate?: string
    endDate?: string
    province?: string
    territory?: string
    violenceType?: string
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED'
    complaintType?: 'VICTIM_DIRECT' | 'INVESTIGATOR_ASSISTED'
    contactPreference?: 'ANONYMOUS' | 'TO_BE_CONTACTED'
  }): Promise<Blob> {
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const url = `${this.baseURL}/reports/complaints/excel${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors de l\'export Excel' }))
      throw new ApiError(error.message || 'Erreur lors de l\'export Excel', response.status)
    }

    return response.blob()
  }
}

// Instance singleton
export const apiService = new ApiService()

// Hook pour utiliser l'API dans React
export function useApi() {
  return apiService
}
