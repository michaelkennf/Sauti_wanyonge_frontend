"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Shield, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Fingerprint,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useBiometricAuth } from "@/hooks/use-biometric-auth"

export interface Investigator {
  id: string
  name: string
  email: string
  phone: string
  badgeNumber: string
  department: string
  province: string
  zone: string
  status: 'active' | 'inactive' | 'pending'
  biometricRegistered: boolean
  createdAt: Date
  lastLogin?: Date
  totalInvestigations: number
  pendingInvestigations: number
}

export interface NGO {
  id: string
  name: string
  email: string
  phone: string
  registrationNumber: string
  province: string
  zone: string
  status: 'active' | 'inactive' | 'pending'
  contactPerson: string
  createdAt: Date
  lastActivity?: Date
  totalCases: number
  activeCases: number
}

export default function AdminManagementPage() {
  const [activeTab, setActiveTab] = useState<'investigators' | 'ngos'>('investigators')
  const [investigators, setInvestigators] = useState<Investigator[]>([])
  const [ngos, setNGOs] = useState<NGO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Investigator | NGO | null>(null)

  // Données de formulaire pour création/édition
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    badgeNumber: "",
    department: "",
    province: "",
    zone: "",
    registrationNumber: "",
    contactPerson: "",
  })

  const { registerBiometric } = useBiometricAuth()

  const provinces = [
    "Kinshasa", "Kongo-Central", "Kwango", "Kwilu", "Mai-Ndombe",
    "Équateur", "Nord-Ubangi", "Sud-Ubangi", "Mongala", "Tshuapa",
    "Bas-Uele", "Haut-Uele", "Ituri", "Tshopo", "Nord-Kivu",
    "Sud-Kivu", "Maniema", "Sankuru", "Kasaï", "Kasaï-Central",
    "Kasaï-Oriental", "Lomami", "Haut-Lomami", "Lualaba",
    "Haut-Katanga", "Tanganyika"
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Simulation de chargement des données
      const mockInvestigators: Investigator[] = [
        {
          id: "INV001",
          name: "Marie Kabila",
          email: "marie.kabila@sautiyawayonge.cd",
          phone: "+243 123 456 789",
          badgeNumber: "INV-2024-001",
          department: "Enquêtes spécialisées",
          province: "Kinshasa",
          zone: "Kinshasa - Zone 1",
          status: "active",
          biometricRegistered: true,
          createdAt: new Date("2024-01-15"),
          lastLogin: new Date("2024-01-20"),
          totalInvestigations: 45,
          pendingInvestigations: 3,
        },
        {
          id: "INV002",
          name: "Jean Mputu",
          email: "jean.mputu@sautiyawayonge.cd",
          phone: "+243 987 654 321",
          badgeNumber: "INV-2024-002",
          department: "Enquêtes générales",
          province: "Kongo-Central",
          zone: "Kongo-Central - Zone 2",
          status: "active",
          biometricRegistered: false,
          createdAt: new Date("2024-01-20"),
          lastLogin: new Date("2024-01-19"),
          totalInvestigations: 23,
          pendingInvestigations: 1,
        },
        {
          id: "INV003",
          name: "Sophie Tshisekedi",
          email: "sophie.tshisekedi@sautiyawayonge.cd",
          phone: "+243 555 123 456",
          badgeNumber: "INV-2024-003",
          department: "Enquêtes spécialisées",
          province: "Nord-Kivu",
          zone: "Nord-Kivu - Zone 3",
          status: "pending",
          biometricRegistered: false,
          createdAt: new Date("2024-01-25"),
          totalInvestigations: 0,
          pendingInvestigations: 0,
        },
      ]

      const mockNGOs: NGO[] = [
        {
          id: "NGO001",
          name: "Association des Femmes pour la Paix",
          email: "contact@afp-rdc.org",
          phone: "+243 111 222 333",
          registrationNumber: "NGO-2024-001",
          province: "Kinshasa",
          zone: "Kinshasa - Zone 1",
          status: "active",
          contactPerson: "Grace Mbuyi",
          createdAt: new Date("2024-01-10"),
          lastActivity: new Date("2024-01-20"),
          totalCases: 156,
          activeCases: 12,
        },
        {
          id: "NGO002",
          name: "Centre d'Accueil des Victimes",
          email: "info@cav-kivu.org",
          phone: "+243 444 555 666",
          registrationNumber: "NGO-2024-002",
          province: "Nord-Kivu",
          zone: "Nord-Kivu - Zone 3",
          status: "active",
          contactPerson: "Joseph Kabila",
          createdAt: new Date("2024-01-12"),
          lastActivity: new Date("2024-01-19"),
          totalCases: 89,
          activeCases: 8,
        },
      ]

      setInvestigators(mockInvestigators)
      setNGOs(mockNGOs)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      if (activeTab === 'investigators') {
        const newInvestigator: Investigator = {
          id: `INV${Date.now()}`,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          badgeNumber: formData.badgeNumber,
          department: formData.department,
          province: formData.province,
          zone: formData.zone,
          status: 'pending',
          biometricRegistered: false,
          createdAt: new Date(),
          totalInvestigations: 0,
          pendingInvestigations: 0,
        }
        setInvestigators(prev => [...prev, newInvestigator])
      } else {
        const newNGO: NGO = {
          id: `NGO${Date.now()}`,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          registrationNumber: formData.registrationNumber,
          province: formData.province,
          zone: formData.zone,
          status: 'pending',
          contactPerson: formData.contactPerson,
          createdAt: new Date(),
          totalCases: 0,
          activeCases: 0,
        }
        setNGOs(prev => [...prev, newNGO])
      }

      setIsCreateDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Erreur lors de la création:', error)
    }
  }

  const handleEdit = (item: Investigator | NGO) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      email: item.email,
      phone: item.phone,
      badgeNumber: 'badgeNumber' in item ? item.badgeNumber : "",
      department: 'department' in item ? item.department : "",
      province: item.province,
      zone: item.zone,
      registrationNumber: 'registrationNumber' in item ? item.registrationNumber : "",
      contactPerson: 'contactPerson' in item ? item.contactPerson : "",
    })
  }

  const handleUpdate = async () => {
    if (!editingItem) return

    try {
      if (activeTab === 'investigators') {
        setInvestigators(prev => prev.map(inv => 
          inv.id === editingItem.id 
            ? { ...inv, ...formData, status: 'active' as const }
            : inv
        ))
      } else {
        setNGOs(prev => prev.map(ngo => 
          ngo.id === editingItem.id 
            ? { ...ngo, ...formData, status: 'active' as const }
            : ngo
        ))
      }

      setEditingItem(null)
      resetForm()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      if (activeTab === 'investigators') {
        setInvestigators(prev => prev.filter(inv => inv.id !== id))
      } else {
        setNGOs(prev => prev.filter(ngo => ngo.id !== id))
      }
    }
  }

  const handleBiometricRegistration = async (investigatorId: string) => {
    try {
      // Simulation de l'enregistrement biométrique
      await registerBiometric(investigatorId, `investigator-${investigatorId}`)
      
      setInvestigators(prev => prev.map(inv => 
        inv.id === investigatorId 
          ? { ...inv, biometricRegistered: true }
          : inv
      ))
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement biométrique:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      badgeNumber: "",
      department: "",
      province: "",
      zone: "",
      registrationNumber: "",
      contactPerson: "",
    })
  }

  const filteredData = () => {
    const data = activeTab === 'investigators' ? investigators : ngos
    let filtered = data

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ('badgeNumber' in item && item.badgeNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ('registrationNumber' in item && item.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtrage par statut
    if (filterStatus !== "all") {
      filtered = filtered.filter(item => item.status === filterStatus)
    }

    return filtered
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Actif</Badge>
      case 'inactive':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Inactif</Badge>
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />En attente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestion des comptes</h1>
          <p className="text-muted-foreground">
            Gérez les comptes enquêteurs et ONG autorisés à utiliser la plateforme.
          </p>
        </div>

        {/* Onglets */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-6 w-fit">
          <Button
            variant={activeTab === 'investigators' ? "default" : "ghost"}
            onClick={() => setActiveTab('investigators')}
            className="gap-2"
          >
            <User className="h-4 w-4" />
            Enquêteurs ({investigators.length})
          </Button>
          <Button
            variant={activeTab === 'ngos' ? "default" : "ghost"}
            onClick={() => setActiveTab('ngos')}
            className="gap-2"
          >
            <Shield className="h-4 w-4" />
            ONG ({ngos.length})
          </Button>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Rechercher ${activeTab === 'investigators' ? 'un enquêteur' : 'une ONG'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter {activeTab === 'investigators' ? 'un enquêteur' : 'une ONG'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  Ajouter {activeTab === 'investigators' ? 'un enquêteur' : 'une ONG'}
                </DialogTitle>
                <DialogDescription>
                  Remplissez les informations pour créer un nouveau compte.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nom et prénom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+243 XXX XXX XXX"
                    />
                  </div>
                  {activeTab === 'investigators' ? (
                    <div className="space-y-2">
                      <Label htmlFor="badgeNumber">Numéro de badge</Label>
                      <Input
                        id="badgeNumber"
                        value={formData.badgeNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, badgeNumber: e.target.value }))}
                        placeholder="INV-2024-XXX"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Numéro d'enregistrement</Label>
                      <Input
                        id="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                        placeholder="NGO-2024-XXX"
                      />
                    </div>
                  )}
                </div>

                {activeTab === 'investigators' && (
                  <div className="space-y-2">
                    <Label htmlFor="department">Département</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Département d'affectation"
                    />
                  </div>
                )}

                {activeTab === 'ngos' && (
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Personne de contact</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                      placeholder="Nom de la personne de contact"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Select value={formData.province} onValueChange={(value) => setFormData(prev => ({ ...prev, province: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zone">Zone</Label>
                    <Input
                      id="zone"
                      value={formData.zone}
                      onChange={(e) => setFormData(prev => ({ ...prev, zone: e.target.value }))}
                      placeholder="Zone d'intervention"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreate}>
                    Créer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tableau des données */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>
              {activeTab === 'investigators' ? 'Liste des enquêteurs' : 'Liste des ONG'}
            </CardTitle>
            <CardDescription>
              {filteredData().length} {activeTab === 'investigators' ? 'enquêteur(s)' : 'ONG'} trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Localisation</TableHead>
                      <TableHead>Statut</TableHead>
                      {activeTab === 'investigators' && <TableHead>Biométrie</TableHead>}
                      <TableHead>Activité</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData().map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            {activeTab === 'investigators' && 'badgeNumber' in item && (
                              <div className="text-sm text-muted-foreground">{item.badgeNumber}</div>
                            )}
                            {activeTab === 'ngos' && 'registrationNumber' in item && (
                              <div className="text-sm text-muted-foreground">{item.registrationNumber}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3" />
                              {item.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3" />
                              {item.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-3 w-3" />
                              {item.province}
                            </div>
                            <div className="text-sm text-muted-foreground">{item.zone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(item.status)}
                        </TableCell>
                        {activeTab === 'investigators' && (
                          <TableCell>
                            {'biometricRegistered' in item ? (
                              item.biometricRegistered ? (
                                <Badge variant="default" className="bg-green-500">
                                  <Fingerprint className="h-3 w-3 mr-1" />
                                  Enregistré
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleBiometricRegistration(item.id)}
                                  className="gap-1"
                                >
                                  <Fingerprint className="h-3 w-3" />
                                  Enregistrer
                                </Button>
                              )
                            ) : null}
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {activeTab === 'investigators' ? (
                              <>
                                <div>Enquêtes: {('totalInvestigations' in item ? item.totalInvestigations : 0)}</div>
                                <div>En attente: {('pendingInvestigations' in item ? item.pendingInvestigations : 0)}</div>
                              </>
                            ) : (
                              <>
                                <div>Cas totaux: {('totalCases' in item ? item.totalCases : 0)}</div>
                                <div>Actifs: {('activeCases' in item ? item.activeCases : 0)}</div>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog d'édition */}
        {editingItem && (
          <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  Modifier {activeTab === 'investigators' ? 'l\'enquêteur' : 'l\'ONG'}
                </DialogTitle>
                <DialogDescription>
                  Modifiez les informations de {editingItem.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Même formulaire que pour la création */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nom complet</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">E-mail</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setEditingItem(null)}>
                    Annuler
                  </Button>
                  <Button onClick={handleUpdate}>
                    Mettre à jour
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
