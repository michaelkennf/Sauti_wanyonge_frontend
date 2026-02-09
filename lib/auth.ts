// Authentication utilities and types
export interface User {
  id: string
  name?: string
  email: string
  role: "admin" | "ADMIN" | "enqueteur" | "investigator" | "INVESTIGATOR" | "institution" | "ngo" | "NGO" | "assurance" | "ASSURANCE" | "visiteur" | "VICTIM"
  province?: string
  isActive?: boolean
  status?: string
  aiAccessLevel?: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// TODO: Remplacer complètement par des appels API réels via apiService
// Ce service mock est temporaire et doit être supprimé une fois l'authentification API complètement intégrée
// NOTE: Actuellement utilisé par navbar, profile, protected-route - migrer vers apiService.login()
export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock user data
    const user: User = {
      id: "1",
      name: "Admin User",
      email,
      role: "admin",
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    const token = "mock-jwt-token"

    // Store in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
      localStorage.setItem("user", JSON.stringify(user))
    }

    return { user, token }
  },

  register: async (data: {
    name: string
    email: string
    password: string
    role: "enqueteur" | "institution"
    province: string
  }): Promise<{ success: boolean; message: string }> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      message: "Compte créé avec succès. En attente d'activation par l'administrateur.",
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user")
    }
  },

  getCurrentUser: (): User | null => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user")
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  },

  isAuthenticated: (): boolean => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("auth_token")
    }
    return false
  },
}

// Role-based access control
export const canAccess = (userRole: User["role"], requiredRole: User["role"][]): boolean => {
  return requiredRole.includes(userRole)
}

export const getRoleRedirect = (role: User["role"]): string => {
  switch (role) {
    case "admin":
      return "/admin/dashboard"
    case "enqueteur":
      return "/enqueteur/home"
    case "institution":
      return "/institution/home"
    default:
      return "/"
  }
}
