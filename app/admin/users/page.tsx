"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  UserPlus,
  Shield,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Fingerprint,
  MapPin,
  Building,
  UserCheck,
  AlertTriangle
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { apiService } from "@/lib/api"
import { handleApiError } from "@/lib/api-error-handler"

// Types pour les utilisateurs
interface User {
  id: string
  email: string
  role: 'ADMIN' | 'INVESTIGATOR' | 'NGO' | 'ASSURANCE'
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  aiAccessLevel: 'GLOBAL' | 'REGIONAL' | 'NONE'
  createdAt: string
  lastLogin?: string
  investigator?: {
    name: string
    badgeNumber: string
    department: string
    province: string
    zone: string
    biometricRegistered: boolean
  }
  ngo?: {
    name: string
    registrationNumber: string
    province: string
    zone: string
    contactPerson: string
  }
  assurance?: {
    name: string
    contactPerson: string
  }
}

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Formulaire de création/édition
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "INVESTIGATOR" as User['role'],
    status: "PENDING" as User['status'],
    aiAccessLevel: "NONE" as User['aiAccessLevel'],
    // Champs spécifiques enquêteur
    investigatorName: "",
    badgeNumber: "",
    department: "",
    province: "",
    zone: "",
    // Champs spécifiques ONG
    ngoName: "",
    registrationNumber: "",
    ngoProvince: "",
    ngoZone: "",
    contactPerson: "",
    // Champs spécifiques Assurance
    assuranceName: "",
    assuranceContactPerson: ""
  })

  // Charger les utilisateurs
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      
      // Charger les utilisateurs depuis l'API
      const { getApiUrl } = await import('@/lib/api-url')
      const API_URL = getApiUrl()
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

      const response = await fetch(`${API_URL}/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          // Transformer les données de l'API au format attendu
          const transformedUsers: User[] = result.data.map((user: any) => ({
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            aiAccessLevel: user.aiAccessLevel,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            investigator: user.investigator ? {
              name: user.investigator.name,
              badgeNumber: user.investigator.badgeNumber,
              department: user.investigator.department,
              province: user.investigator.province,
              zone: user.investigator.zone,
              biometricRegistered: user.investigator.biometricRegistered || false
            } : undefined,
            ngo: user.ngo ? {
              name: user.ngo.name,
              registrationNumber: user.ngo.registrationNumber,
              province: user.ngo.province,
              zone: user.ngo.zone,
              contactPerson: user.ngo.contactPerson
            } : undefined,
            assurance: user.assurance ? {
              name: user.assurance.name,
              contactPerson: user.assurance.contactPerson
            } : undefined
          }))
          
          setUsers(transformedUsers)
        } else {
          setUsers([])
        }
      } else {
        throw new Error('Erreur lors du chargement des utilisateurs')
      }
    } catch (error) {
      handleApiError(error, "Chargement des utilisateurs", true)
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.investigator?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.ngo?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.assurance?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = selectedRole === "all" || user.role === selectedRole
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  // Créer un nouvel utilisateur
  const handleCreateUser = async () => {
    try {
      // Validation des champs requis selon le rôle
      if (formData.role === "INVESTIGATOR") {
        if (!formData.investigatorName || !formData.badgeNumber || !formData.department) {
          toast({
            title: "Erreur de validation",
            description: "Veuillez remplir tous les champs requis pour l'enquêteur",
            variant: "destructive"
          })
          return
        }
      } else if (formData.role === "NGO") {
        if (!formData.ngoName || !formData.registrationNumber || !formData.contactPerson) {
          toast({
            title: "Erreur de validation",
            description: "Veuillez remplir tous les champs requis pour l'ONG",
            variant: "destructive"
          })
          return
        }
      } else if (formData.role === "ASSURANCE") {
        if (!formData.assuranceName || !formData.assuranceContactPerson) {
          toast({
            title: "Erreur de validation",
            description: "Veuillez remplir tous les champs requis pour l'Assurance",
            variant: "destructive"
          })
          return
        }
      }

      // Appel API pour créer l'utilisateur
      const { getApiUrl } = await import('@/lib/api-url')
      const API_URL = getApiUrl()
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      
      const response = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Utilisateur créé avec succès",
          variant: "default"
        })
        setIsCreateDialogOpen(false)
        resetForm()
        loadUsers()
      } else {
        throw new Error('Erreur de création')
      }
    } catch (error) {
      handleApiError(error, "Création de l'utilisateur", true)
    }
  }

  // Modifier le statut d'un utilisateur
  const handleStatusChange = async (userId: string, newStatus: User['status']) => {
    try {
      const { getApiUrl } = await import('@/lib/api-url')
      const API_URL = getApiUrl()
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      
      const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Statut utilisateur mis à jour",
          variant: "default"
        })
        loadUsers()
      } else {
        throw new Error('Erreur de mise à jour')
      }
    } catch (error) {
      handleApiError(error, "Mise à jour du statut", true)
    }
  }

  // Supprimer un utilisateur
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return

    try {
      const { getApiUrl } = await import('@/lib/api-url')
      const API_URL = getApiUrl()
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Utilisateur supprimé avec succès",
          variant: "default"
        })
        loadUsers()
      } else {
        throw new Error('Erreur de suppression')
      }
    } catch (error) {
      handleApiError(error, "Suppression de l'utilisateur", true)
    }
  }

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      role: "INVESTIGATOR",
      status: "PENDING",
      aiAccessLevel: "NONE",
      investigatorName: "",
      badgeNumber: "",
      department: "",
      province: "",
      zone: "",
      ngoName: "",
      registrationNumber: "",
      ngoProvince: "",
      ngoZone: "",
      contactPerson: "",
      assuranceName: "",
      assuranceContactPerson: ""
    })
  }

  const getStatusIcon = (status: User['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'INACTIVE':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default" className="bg-green-500">Actif</Badge>
      case 'INACTIVE':
        return <Badge variant="destructive">Inactif</Badge>
      case 'PENDING':
        return <Badge variant="secondary">En attente</Badge>
    }
  }

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-primary" />
      case 'INVESTIGATOR':
        return <Fingerprint className="h-4 w-4 text-secondary" />
      case 'NGO':
        return <Building className="h-4 w-4 text-accent" />
      case 'ASSURANCE':
        return <UserCheck className="h-4 w-4 text-destructive" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                <Users className="h-8 w-8" />
                Gestion des utilisateurs
              </h1>
              <p className="text-muted-foreground mt-2">
                Administration des comptes utilisateurs et permissions
              </p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Nouvel utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
                  <DialogDescription>
                    Ajouter un nouvel utilisateur au système
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Informations de base */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Informations de base</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="utilisateur@sauti-ya-wayonge.rdc"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Mot de passe temporaire"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="role">Rôle</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as User['role'] }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INVESTIGATOR">Enquêteur</SelectItem>
                            <SelectItem value="NGO">ONG</SelectItem>
                            <SelectItem value="ASSURANCE">Assurance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="status">Statut</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as User['status'] }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Actif</SelectItem>
                            <SelectItem value="PENDING">En attente</SelectItem>
                            <SelectItem value="INACTIVE">Inactif</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="aiAccessLevel">Niveau d'accès IA</Label>
                        <Select
                          value={formData.aiAccessLevel}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, aiAccessLevel: value as User['aiAccessLevel'] }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NONE">Aucun</SelectItem>
                            <SelectItem value="REGIONAL">Régional</SelectItem>
                            <SelectItem value="GLOBAL">Global</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Champs spécifiques selon le rôle */}
                  {formData.role === "INVESTIGATOR" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Informations enquêteur</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="investigatorName">Nom complet</Label>
                          <Input
                            id="investigatorName"
                            value={formData.investigatorName}
                            onChange={(e) => setFormData(prev => ({ ...prev, investigatorName: e.target.value }))}
                            placeholder="Nom et prénom"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="badgeNumber">Numéro de badge</Label>
                          <Input
                            id="badgeNumber"
                            value={formData.badgeNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, badgeNumber: e.target.value }))}
                            placeholder="INV-001"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="department">Département</Label>
                          <Input
                            id="department"
                            value={formData.department}
                            onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                            placeholder="Police Nationale"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="province">Province</Label>
                          <Select
                            value={formData.province}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, province: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner la province" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Kinshasa">Kinshasa</SelectItem>
                              <SelectItem value="Kongo-Central">Kongo-Central</SelectItem>
                              <SelectItem value="Kwango">Kwango</SelectItem>
                              <SelectItem value="Kwilu">Kwilu</SelectItem>
                              <SelectItem value="Mai-Ndombe">Mai-Ndombe</SelectItem>
                              <SelectItem value="Équateur">Équateur</SelectItem>
                              <SelectItem value="Mongala">Mongala</SelectItem>
                              <SelectItem value="Nord-Ubangi">Nord-Ubangi</SelectItem>
                              <SelectItem value="Sud-Ubangi">Sud-Ubangi</SelectItem>
                              <SelectItem value="Tshuapa">Tshuapa</SelectItem>
                              <SelectItem value="Ituri">Ituri</SelectItem>
                              <SelectItem value="Haut-Uele">Haut-Uele</SelectItem>
                              <SelectItem value="Bas-Uele">Bas-Uele</SelectItem>
                              <SelectItem value="Tshopo">Tshopo</SelectItem>
                              <SelectItem value="Nord-Kivu">Nord-Kivu</SelectItem>
                              <SelectItem value="Sud-Kivu">Sud-Kivu</SelectItem>
                              <SelectItem value="Maniema">Maniema</SelectItem>
                              <SelectItem value="Tanganyika">Tanganyika</SelectItem>
                              <SelectItem value="Haut-Lomami">Haut-Lomami</SelectItem>
                              <SelectItem value="Lualaba">Lualaba</SelectItem>
                              <SelectItem value="Haut-Katanga">Haut-Katanga</SelectItem>
                              <SelectItem value="Kasaï">Kasaï</SelectItem>
                              <SelectItem value="Kasaï-Central">Kasaï-Central</SelectItem>
                              <SelectItem value="Kasaï-Oriental">Kasaï-Oriental</SelectItem>
                              <SelectItem value="Lomami">Lomami</SelectItem>
                              <SelectItem value="Sankuru">Sankuru</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="zone">Zone</Label>
                          <Input
                            id="zone"
                            value={formData.zone}
                            onChange={(e) => setFormData(prev => ({ ...prev, zone: e.target.value }))}
                            placeholder="Gombe"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.role === "NGO" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Informations ONG</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ngoName">Nom de l'ONG</Label>
                          <Input
                            id="ngoName"
                            value={formData.ngoName}
                            onChange={(e) => setFormData(prev => ({ ...prev, ngoName: e.target.value }))}
                            placeholder="Nom de l'organisation"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="registrationNumber">Numéro d'enregistrement</Label>
                          <Input
                            id="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                            placeholder="NGO-2024-001"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="ngoProvince">Province</Label>
                          <Select
                            value={formData.ngoProvince}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, ngoProvince: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner la province" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Kinshasa">Kinshasa</SelectItem>
                              <SelectItem value="Kongo-Central">Kongo-Central</SelectItem>
                              <SelectItem value="Kwango">Kwango</SelectItem>
                              <SelectItem value="Kwilu">Kwilu</SelectItem>
                              <SelectItem value="Mai-Ndombe">Mai-Ndombe</SelectItem>
                              <SelectItem value="Équateur">Équateur</SelectItem>
                              <SelectItem value="Mongala">Mongala</SelectItem>
                              <SelectItem value="Nord-Ubangi">Nord-Ubangi</SelectItem>
                              <SelectItem value="Sud-Ubangi">Sud-Ubangi</SelectItem>
                              <SelectItem value="Tshuapa">Tshuapa</SelectItem>
                              <SelectItem value="Ituri">Ituri</SelectItem>
                              <SelectItem value="Haut-Uele">Haut-Uele</SelectItem>
                              <SelectItem value="Bas-Uele">Bas-Uele</SelectItem>
                              <SelectItem value="Tshopo">Tshopo</SelectItem>
                              <SelectItem value="Nord-Kivu">Nord-Kivu</SelectItem>
                              <SelectItem value="Sud-Kivu">Sud-Kivu</SelectItem>
                              <SelectItem value="Maniema">Maniema</SelectItem>
                              <SelectItem value="Tanganyika">Tanganyika</SelectItem>
                              <SelectItem value="Haut-Lomami">Haut-Lomami</SelectItem>
                              <SelectItem value="Lualaba">Lualaba</SelectItem>
                              <SelectItem value="Haut-Katanga">Haut-Katanga</SelectItem>
                              <SelectItem value="Kasaï">Kasaï</SelectItem>
                              <SelectItem value="Kasaï-Central">Kasaï-Central</SelectItem>
                              <SelectItem value="Kasaï-Oriental">Kasaï-Oriental</SelectItem>
                              <SelectItem value="Lomami">Lomami</SelectItem>
                              <SelectItem value="Sankuru">Sankuru</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="ngoZone">Zone</Label>
                          <Input
                            id="ngoZone"
                            value={formData.ngoZone}
                            onChange={(e) => setFormData(prev => ({ ...prev, ngoZone: e.target.value }))}
                            placeholder="Gombe"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="contactPerson">Personne de contact</Label>
                          <Input
                            id="contactPerson"
                            value={formData.contactPerson}
                            onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                            placeholder="Nom de la personne de contact"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.role === "ASSURANCE" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Informations Assurance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="assuranceName">Nom de l'assurance</Label>
                          <Input
                            id="assuranceName"
                            value={formData.assuranceName}
                            onChange={(e) => setFormData(prev => ({ ...prev, assuranceName: e.target.value }))}
                            placeholder="Nom de l'assurance"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="assuranceContactPerson">Personne de contact</Label>
                          <Input
                            id="assuranceContactPerson"
                            value={formData.assuranceContactPerson}
                            onChange={(e) => setFormData(prev => ({ ...prev, assuranceContactPerson: e.target.value }))}
                            placeholder="Nom de la personne de contact"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateUser}>
                    Créer l'utilisateur
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filtres et recherche */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Rechercher par email, nom..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Tous les rôles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="INVESTIGATOR">Enquêteur</SelectItem>
                    <SelectItem value="NGO">ONG</SelectItem>
                    <SelectItem value="ASSURANCE">Assurance</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="ACTIVE">Actif</SelectItem>
                    <SelectItem value="PENDING">En attente</SelectItem>
                    <SelectItem value="INACTIVE">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tableau des utilisateurs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Utilisateurs ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Détails</TableHead>
                        <TableHead>Dernière connexion</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {getRoleIcon(user.role)}
                              <div>
                                <div className="font-medium">{user.email}</div>
                                {user.investigator && (
                                  <div className="text-sm text-muted-foreground">
                                    {user.investigator.name}
                                  </div>
                                )}
                                {user.ngo && (
                                  <div className="text-sm text-muted-foreground">
                                    {user.ngo.name}
                                  </div>
                                )}
                                {user.assurance && (
                                  <div className="text-sm text-muted-foreground">
                                    {user.assurance.name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge variant="outline" className="gap-1">
                              {getRoleIcon(user.role)}
                              {user.role}
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(user.status)}
                              {getStatusBadge(user.status)}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              {user.investigator && (
                                <div className="text-sm">
                                  <div className="flex items-center gap-1">
                                    <Fingerprint className="h-3 w-3" />
                                    Badge: {user.investigator.badgeNumber}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {user.investigator.province} - {user.investigator.zone}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {user.investigator.biometricRegistered ? (
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                    ) : (
                                      <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                    )}
                                    Biométrie: {user.investigator.biometricRegistered ? "Enregistrée" : "Non enregistrée"}
                                  </div>
                                </div>
                              )}
                              {user.ngo && (
                                <div className="text-sm">
                                  <div className="flex items-center gap-1">
                                    <Building className="h-3 w-3" />
                                    {user.ngo.registrationNumber}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {user.ngo.province} - {user.ngo.zone}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <UserCheck className="h-3 w-3" />
                                    Contact: {user.ngo.contactPerson}
                                  </div>
                                </div>
                              )}
                              {user.assurance && (
                                <div className="text-sm">
                                  <div className="flex items-center gap-1">
                                    <UserCheck className="h-3 w-3" />
                                    Contact: {user.assurance.contactPerson}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {user.lastLogin ? (
                                <div>
                                  {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                                  <br />
                                  {new Date(user.lastLogin).toLocaleTimeString('fr-FR')}
                                </div>
                              ) : (
                                "Jamais connecté"
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(user.id, user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}>
                                  {user.status === 'ACTIVE' ? (
                                    <>
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Désactiver
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Activer
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}