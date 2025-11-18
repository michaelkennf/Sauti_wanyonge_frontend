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
    territory: string
    groupement: string
    village: string
    householdSize: number
    currentAddress: string
    status: string
    natureOfFacts: string
  }
  geolocation: {
    latitude: number
    longitude: number
    province: string
    territory: string
    groupement: string
    village: string
    address: string
    accuracy: number
  }
  evidence?: Array<{
    type: string
    fileName: string
    fileData?: string
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

class ApiService {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = API_URL
    // Récupérer le token depuis le localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  // Méthodes utilitaires
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      defaultHeaders['Authorization'] = `Bearer ${this.token}`
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      // Optimisation: cache pour les requêtes GET
      cache: options.method === 'GET' ? 'default' : 'no-store',
    }

    try {
      // Timeout pour éviter les requêtes qui traînent
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de requête')
      }

      return data
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Erreur API: Timeout')
        throw new Error('La requête a pris trop de temps')
      }
      console.error('Erreur API:', error)
      throw error
    }
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
      await this.request('/auth/logout', { method: 'POST' })
    } finally {
      this.token = null
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

  async updateComplaintStatus(id: string, status: string): Promise<any> {
    const response = await this.request<any>(`/complaints/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
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
}

// Instance singleton
export const apiService = new ApiService()

// Hook pour utiliser l'API dans React
export function useApi() {
  return apiService
}
