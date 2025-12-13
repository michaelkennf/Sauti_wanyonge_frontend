// Service API pour communiquer avec le backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

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

  // Rafraîchir le token automatiquement
  private async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    if (!this.refreshToken) {
      throw new ApiError('Token de rafraîchissement non disponible', 401, 'NO_REFRESH_TOKEN')
    }

    this.isRefreshing = true
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
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

  // Méthodes utilitaires avec retry et meilleure gestion d'erreurs
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = 2
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const method = options.method || 'GET'
    
    // Timeout adaptatif selon le type de requête
    const timeout = method === 'GET' ? 15000 : 30000 // 15s pour GET, 30s pour POST/PUT/DELETE
    
    // Ne pas définir Content-Type pour FormData (le navigateur le fait automatiquement)
    const isFormData = options.body instanceof FormData
    const defaultHeaders: HeadersInit = isFormData ? {} : {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      defaultHeaders['Authorization'] = `Bearer ${this.token}`
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
        if (response.status === 401 && this.refreshToken && attempt < retries) {
          try {
            await this.refreshAccessToken()
            // Réessayer la requête avec le nouveau token
            response = await makeRequest()
          } catch (refreshError) {
            // Si le refresh échoue, déconnecter
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

          // Erreur réseau
          if (error.message.includes('fetch') || error.message.includes('network') || !navigator.onLine) {
            if (attempt < retries) {
              lastError = new NetworkError('Erreur de connexion réseau')
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
              continue
            }
            throw new NetworkError('Impossible de se connecter au serveur. Vérifiez votre connexion internet.')
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('refresh_token', response.data.refreshToken)
        localStorage.setItem('user', JSON.stringify(response.data.user))
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
      byType: Array<{ name: string; value: number }>
      byProvince: Array<{ zone: string; cas: number }>
      byTreatmentStatus: Array<{ status: string; count: number }>
      byComplaintType: Array<{ type: string; count: number }>
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
        byType: Array<{ name: string; value: number }>
        byProvince: Array<{ zone: string; cas: number }>
        byTreatmentStatus: Array<{ status: string; count: number }>
        byComplaintType: Array<{ type: string; count: number }>
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
